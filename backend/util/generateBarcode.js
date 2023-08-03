// Function to generate a random barcode
const generateBarcode = () => {
  let barcode = '';
  for (let i = 0; i < 10; i++) {
    barcode += Math.floor(Math.random() * 10);
  }
  return barcode;
};
module.exports = {
  generateBarcode,
};
