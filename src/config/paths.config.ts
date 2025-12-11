import path from 'path';
// Define the paths in a TypeScript object
const paths = {
  root: path.resolve(__dirname),
  public: path.resolve(__dirname, './uploads/'),
  assets: './',
  profilePath: './uploads/profile',
  chatImage: './uploads/chats/',
  batchPath: './uploads/batch/',
  coursePath: './uploads/courses/',
  sliderPath: './uploads/slider/',

};

export default paths;
