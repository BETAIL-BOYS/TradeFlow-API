import { Controller, Post, Get, Param, UseInterceptors, UploadedFile, Res, BadRequestException, NotFoundException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { encryptBuffer, decryptBuffer } from '../common/utils/crypto';
import FormData from 'form-data';
import axios from 'axios';

@Controller('api/v1/documents')
export class DocumentsController {
  // Replace this with your actual Prisma service injection if available
  private prisma = {
    documentRegistry: {
      create: async (args: any) => true,
      findUnique: async (args: any) => ({
        iv: 'mock-iv',
        authTag: 'mock-tag',
        mimeType: 'application/pdf',
        name: 'invoice.pdf'
      })
    }
  };

  @Post('upload')
  @UseInterceptors(FileInterceptor('document', {
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, callback) => {
      if (!['application/pdf', 'image/jpeg', 'image/png'].includes(file.mimetype)) {
        return callback(new BadRequestException('Invalid format. Allowed: PDF, JPG, PNG.'), false);
      }
      callback(null, true);
    },
  }))
  async uploadDocument(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file uploaded.');

    // Encrypt raw buffer directly in system memory
    const { ciphertext, iv, authTag } = encryptBuffer(file.buffer);

    // Pin encrypted binary payload to Pinata API
    const formData = new FormData();
    formData.append('file', ciphertext, { filename: file.originalname });

    const ipfsRes = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
      headers: { ...formData.getHeaders(), Authorization: `Bearer ${process.env.PINATA_JWT}` },
    });

    const cid = ipfsRes.data.IpfsHash;

    // Persist layout pointers to DB
    await this.prisma.documentRegistry.create({
      data: { cid, iv, authTag, mimeType: file.mimetype, name: file.originalname },
    });

    return { success: true, cid };
  }

  @Get(':cid')
  async getDocument(@Param('cid') cid: string, @Res() res: Response) {
    const record = await this.prisma.documentRegistry.findUnique({ where: { cid } });
    if (!record) throw new NotFoundException('Document mapping not found.');

    const gatewayRes = await axios.get(`https://gateway.pinata.cloud/ipfs/${cid}`, {
      responseType: 'arraybuffer',
    });
    
    const decrypted = decryptBuffer(Buffer.from(gatewayRes.data), record.iv, record.authTag);

    res.setHeader('Content-Type', record.mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${record.name}"`);
    return res.send(decrypted);
  }
}