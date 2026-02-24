"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InitialMigration1708665600000 = void 0;
const typeorm_1 = require("typeorm");
class InitialMigration1708665600000 {
    constructor() {
        this.name = 'InitialMigration1708665600000';
    }
    async up(queryRunner) {
        await queryRunner.createTable(new typeorm_1.Table({
            name: 'users',
            columns: [
                {
                    name: 'id',
                    type: 'uuid',
                    isPrimary: true,
                    generationStrategy: 'uuid',
                    default: 'uuid_generate_v4()',
                },
                {
                    name: 'publicKey',
                    type: 'varchar',
                    isUnique: true,
                },
                {
                    name: 'email',
                    type: 'varchar',
                    isNullable: true,
                },
                {
                    name: 'isActive',
                    type: 'boolean',
                    default: true,
                },
                {
                    name: 'createdAt',
                    type: 'timestamp',
                    default: 'CURRENT_TIMESTAMP',
                },
                {
                    name: 'updatedAt',
                    type: 'timestamp',
                    default: 'CURRENT_TIMESTAMP',
                    onUpdate: 'CURRENT_TIMESTAMP',
                },
            ],
        }), true);
        await queryRunner.createTable(new typeorm_1.Table({
            name: 'invoices',
            columns: [
                {
                    name: 'id',
                    type: 'int',
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: 'increment',
                },
                {
                    name: 'amount',
                    type: 'decimal',
                    precision: 10,
                    scale: 2,
                },
                {
                    name: 'date',
                    type: 'timestamp',
                },
                {
                    name: 'customer',
                    type: 'varchar',
                },
                {
                    name: 'description',
                    type: 'text',
                    isNullable: true,
                },
                {
                    name: 'riskScore',
                    type: 'int',
                    default: 0,
                },
                {
                    name: 'status',
                    type: 'varchar',
                    default: "'Pending'",
                },
                {
                    name: 'processedAt',
                    type: 'timestamp',
                    default: 'CURRENT_TIMESTAMP',
                },
                {
                    name: 'userId',
                    type: 'uuid',
                    isNullable: true,
                },
                {
                    name: 'createdAt',
                    type: 'timestamp',
                    default: 'CURRENT_TIMESTAMP',
                },
                {
                    name: 'updatedAt',
                    type: 'timestamp',
                    default: 'CURRENT_TIMESTAMP',
                    onUpdate: 'CURRENT_TIMESTAMP',
                },
            ],
        }), true);
        await queryRunner.createForeignKey('invoices', {
            columnNames: ['userId'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'SET NULL',
        });
        await queryRunner.createIndex('invoices', new typeorm_1.Index('IDX_INVOICE_STATUS', ['status']));
    }
    async down(queryRunner) {
        await queryRunner.dropTable('invoices');
        await queryRunner.dropTable('users');
    }
}
exports.InitialMigration1708665600000 = InitialMigration1708665600000;
//# sourceMappingURL=1708665600000-InitialMigration.js.map