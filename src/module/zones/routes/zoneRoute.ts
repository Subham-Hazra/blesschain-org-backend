import { Router } from 'express';
import { Routes } from '@/interface/route.interface';
import authMiddleware from '@/middlewares/auth.middlewares';
import { ZoneController } from '../controllers/ZoneController';

class CourseRoute implements Routes {
    public path = '/';
    public router = Router();
    public zoneController = new ZoneController();
    constructor() {
        this.initializeRoutes();
    }
    private initializeRoutes() {
        this.router.post(`${this.path}`, authMiddleware, this.zoneController.create);
        this.router.post(`${this.path}get-locations`, authMiddleware, this.zoneController.getLocationByLatLong);
    }
}

export default CourseRoute;

