import { HttpException } from "@/exceptions/HttpException";
import { ImageProcessor } from "@/util/ImageProcessor";
import { isEmpty } from "@/util/util";
import { QueryParams } from "@/interface/query.interface";
import { QueryBuilder } from "@/util/query";
import mongoose, { FilterQuery } from "mongoose";
import globalPaths from "@/config/paths.config";
import { FileManager } from "@/helper/delete";
import { ResponseHelper } from "@/util/ResponseHelper";
import zoneModel from "../models/zone.schema";
import { Zone, CreateZone } from "../interfaces/index.interface";
export class ZoneService {
    public Zone = zoneModel;

    public fileManager = new FileManager();

    public async create(zoneData: CreateZone): Promise<ResponseHelper> {
        if (isEmpty(zoneData)) throw new HttpException(400, "courseData is empty");
        const { _id, ...rest } = zoneData;
        let query: FilterQuery<CreateZone> = {};
        if (_id) {
            query._id = new mongoose.Types.ObjectId(_id);
        } else {
            query = rest;
        }
        const zoneInfo = JSON.parse(JSON.stringify(rest));
        try {
            const response = await this.Zone
                .findOneAndUpdate(query, zoneInfo, {
                    upsert: true,
                    new: true,
                })
                .exec();

            return response ?? [];
        } catch (error) {

            throw new HttpException(500, "Error updating or creating course");
        }
    }



    public async findZoneByCoordinates(latitude: any, longitude: any): Promise<ResponseHelper> {
        const parsedLatitude = parseFloat(latitude); // Convert to float
        const parsedLongitude = parseFloat(longitude); // Convert to float
        if (isEmpty(latitude && longitude)) throw new HttpException(400, "lat long is empty is empty");

        const point = {
            type: 'Point',
            coordinates: [parsedLongitude, parsedLatitude], // GeoJSON format: [longitude, latitude]
        };
        try {

            const response = await this.Zone.findOne({
                coordinates: {
                    $geoIntersects: {
                        $geometry: point,
                    },
                },
            });
            return response ?? [];
        } catch (error) { 
            throw new HttpException(500, "Error fetching zone");
        }
    }



}
