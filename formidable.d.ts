declare module 'formidable' {
  export class IncomingForm {
    constructor(options?: any);
    parse(req: any, callback: (err: any, fields: any, files: any) => void): void;
    uploadDir: string;
    keepExtensions: boolean;
    maxFileSize: number;
    multiples: boolean;
  }
}
