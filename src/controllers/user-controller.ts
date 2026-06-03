import { Request, Response } from 'express';
import { inject } from 'inversify';
import { controller, httpPost, request, response } from 'inversify-express-utils';
import { BaseController, TYPES, validateRegisterDto, validateLoginDto, AppError } from '../lib';
import { UserService } from '../services';

@controller('/auth')
export class UserController extends BaseController {
    constructor(@inject(TYPES.UserService) private userService: UserService) {
        super();
    }

    @httpPost('/register')
    async register(@request() req: Request, @response() res: Response) {
        try {
            const dto = validateRegisterDto(req.body);
            const result = await this.userService.register(dto);
            return res.status(201).json(result);
        } catch (err) {
            if (err instanceof AppError) {
                return res.status(err.statusCode).json({ error: err.message });
            }
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    @httpPost('/login')
    async login(@request() req: Request, @response() res: Response) {
        try {
            const dto = validateLoginDto(req.body);
            const result = await this.userService.login(dto);
            return res.status(200).json(result);
        } catch (err) {
            if (err instanceof AppError) {
                return res.status(err.statusCode).json({ error: err.message });
            }
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
}
