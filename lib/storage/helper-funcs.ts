import { TextEncoder } from 'util';
import { format } from 'date-fns';
import { Readable } from 'stream';

export const getSizeInBytes = (obj: any) => {
	let str = null;
	if (typeof obj === 'string') {
		str = obj;
	} else {
		str = JSON.stringify(obj);
	}
	6;
	const bytes = new TextEncoder().encode(str).length;
	return bytes;
};

export const getPrettyDate = () => {
	const m = new Date();
	return (
		m.getUTCFullYear() +
		'/' +
		(m.getUTCMonth() + 1) +
		'/' +
		m.getUTCDate() +
		' ' +
		m.getUTCHours() +
		':' +
		m.getUTCMinutes() +
		':' +
		m.getUTCSeconds()
	);
};

export const dailyOf = (directory: string): string => {
	const dat = format(new Date(), 'MM-dd-yyyy');
	return `${directory}/${dat}.json`;
};

export const hourlyOf = (directory: string): string => {
	const dat = format(new Date(), 'MM-dd-yyyy:HH');
	return `${directory}/${dat}.json`;
};

export const minuteByMinuteOf = (directory: string): string => {
	const dat = format(new Date(), 'MM-dd-yyyy:HH:mm');
	return `${directory}/${dat}.json`;
};

/**
 * Converts a given Blob into a Readable stream, which can be consumed by libraries such as FFmpeg.
 * @param {Blob} blob - The Blob to be converted into a Readable stream.
 * @returns {Readable} - A Readable stream that can be consumed by libraries such as FFmpeg.
 */
export const toReadable = async (blob: Blob): Promise<Readable> => {
	const stream = new Readable();
	stream.push(Buffer.from(await blob.arrayBuffer()));
	stream.push(null);
	return stream;
};

export const bufferToReadable = async (blob: Buffer): Promise<Readable> => {
	const stream = new Readable();
	stream.push(Buffer.from(blob.buffer));
	stream.push(null);
	return stream;
};

/**
 * Converts a Blob object to a Buffer.
 * @param {Blob} blob The Blob object to be converted to a Buffer.
 * @returns {Buffer} A Buffer object containing the data from the Blob.
 */
export const blobToBuffer = async (blob: Blob): Promise<Buffer> => {
	const blobby = await blob.arrayBuffer();
	return new Promise((resolve, reject) => {
		const reader = new Readable();
		reader._read = () => {
			return;
		}; // _read is a no-op, needed because Readable expects it
		reader.push(Buffer.from(blobby));
		reader.push(null);

		const chunks: any[] = [];
		reader.on('data', (chunk) => {
			chunks.push(chunk);
		});
		reader.on('end', () => {
			const buffer = Buffer.concat(chunks);
			resolve(buffer);
		});
		reader.on('error', (err) => {
			reject(err);
		});
	});
};
