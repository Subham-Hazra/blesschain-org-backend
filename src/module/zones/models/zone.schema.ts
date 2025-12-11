import { model, Schema, Document } from 'mongoose';
import { Zone } from '@/module/zones/interfaces/index.interface';

const zoneSchema: Schema = new Schema({
  name: { type: String, required: true },
  region: { type: String, required: true },
  coordinates: {
    type: { type: String, default: 'Polygon' }, // GeoJSON type
    coordinates: { type: [[[Number]]], required: true }, // Array of arrays of numbers
  },
  createdAt: { type: Date, default: Date.now },
}, {
  timestamps: true
}
);
zoneSchema.index({ coordinates: '2dsphere' });
const zoneModel = model<Zone & Document>('Zone', zoneSchema);

export default zoneModel;



