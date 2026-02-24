import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiConsumes, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PdfService, ParsedInvoice } from './pdf.service';
import { ParseInvoiceDto } from './dto/parse-invoice.dto';

@ApiTags('invoices')
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly pdfService: PdfService) {}

  @Post('parse')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Parse PDF invoice to extract total amount and due date' })
  @ApiResponse({
    status: 200,
    description: 'Invoice parsed successfully',
    schema: {
      type: 'object',
      properties: {
        totalAmount: { type: 'number', description: 'Total amount found in invoice' },
        dueDate: { type: 'string', description: 'Due date found in invoice (YYYY-MM-DD format)' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid file or parsing failed' })
  async parseInvoice(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: ParseInvoiceDto,
  ): Promise<ParsedInvoice> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException('Only PDF files are allowed');
    }

    try {
      const result = await this.pdfService.parseInvoicePdf(file.buffer);
      return result;
    } catch (error) {
      throw new BadRequestException(`Failed to parse invoice: ${error.message}`);
    }
  }
}
