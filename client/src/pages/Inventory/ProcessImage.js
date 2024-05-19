import 'jimp';

const Jimp = window.Jimp;

export async function preProcessImage(imageFile) {
	let image = await Jimp.read(URL.createObjectURL(imageFile));	


	image.crop(0,0, image.bitmap.width*0.75, image.bitmap.height);
	image.scale(2.0); // Scale factor (you can adjust this as needed)
	
	// Convert to grayscale
	image.grayscale();
	
	
	image.brightness(0.55) // Increase brightness
         .posterize(10)   // Reduce color depth
         .contrast(0.5)   // Further increase contrast

	
	image.invert();
	
	image.convolute([
      [-1, -1, -1],
      [-1, 15, -1],
      [-1, -1, -1]
    ]);
	
	
	return image.getBase64Async(Jimp.MIME_PNG);
}

export function findItems(lines) {
		let itemsFound = [];
		let foundName = '';
		let foundQuant = '';
		let tabheaders = ['Resource','Speedup','Military','Gadget','Other'];
		
		let tabsCleared = false;
		for (let i = 0; i < lines.length; i++) {
			if (!tabsCleared) {
				if (tabheaders.some(searchString => lines[i].text.includes(searchString))) {
					tabsCleared = true;
				}
				continue;
			}
			if (foundName === '' && lines[i].words.length > 1 && !lines[i].text.includes('Owned')) {
				let found = lines[i].text.replace('\n','').match(/(?<name>([0-9A-Z]{1}[0-9a-z*I]{1,}\s*){1,})/);
				if (found) {
					foundName = found.groups.name.trim();
				}
			} else if (foundQuant === '' && lines[i].text.includes('Owned') && foundName !== '') {
				let found = lines[i].text.match(/.*Owned:\s*(?<quant>[0-9]+).*/);
				if (found && found.length > 0) {
				foundQuant = found.groups.quant.trim();
				itemsFound.push({name: foundName, quantity: foundQuant});
				foundName = '';
				foundQuant = '';
				}
			}
		}
		console.log(itemsFound);
		return itemsFound;
};