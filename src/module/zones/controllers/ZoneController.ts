import { NextFunction, Request, Response } from "express";
import { ResponseHelper } from "@/util/ResponseHelper";
import { ZoneService } from "../services/ZoneService";

export class ZoneController {
  private zoneService: ZoneService;

  constructor() {
    this.zoneService = new ZoneService();
  }

  public create  = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const zoneData = req.body;
       
      const result: ResponseHelper = await this.zoneService.create(
        zoneData
      );
      return ResponseHelper.sendSuccessResponse(
        res,
        200,
        result,
        "Zone created successfully."
      );
    } catch (error) {
      next(error);
    }
  };
  public getLocationByLatLong  = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try { 
      const { latitude, longitude } = req.body;
      const result = await this.zoneService.findZoneByCoordinates(latitude,longitude);
      return ResponseHelper.sendSuccessResponse(
        res,
        200,
        result,
        "Zone fetched successfully."
      );
    } catch (error) {
      next(error);
    }
  };

}
