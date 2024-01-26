/* istanbul ignore file */
import express from 'express';
import logger from "@AncientOne/utils/logger";

export const expressDevLogger = (req: express.Request, res: express.Response, next: express.NextFunction): void => {
    const tempoHoraInicio = process.hrtime();

    logger.http(`Request: ${req.method} ${req.url} at ${new Date().toUTCString()}, User-Agent: ${req.get('User-Agent')}`);
    logger.http(`Request Body: ${JSON.stringify(req.body)}`);

    const [oldWrite, oldEnd] = [res.write, res.end];
    const chunks: Buffer[] = [];
    ;(res.write as unknown) = function(chunk: any): void {;
        chunks.push(Buffer.from(chunk));
        ;(oldWrite as Function).apply(res, arguments);
    }

    res.end = function(chunk: any): any {
        if (chunk)
            chunks.push(Buffer.from(chunk));

        const tempoDecorrido = process.hrtime(tempoHoraInicio);
        const tempoDcorridoEmMs = tempoDecorrido[0] * 1000 + tempoDecorrido[1] / 1e6;

        logger.http(`Response ${res.statusCode} ${tempoDcorridoEmMs.toFixed(3)} ms`);

        const body = Buffer.concat(chunks).toString('utf8');
        logger.http(`Response Body: ${body}`);
        ;(oldEnd as Function).apply(res, arguments);
    }
  
    next();
}
