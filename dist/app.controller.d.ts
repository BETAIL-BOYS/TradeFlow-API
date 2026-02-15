import { AppService } from './app.service';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    getInvoices(): any[];
    createInvoice(body: any): any;
}
