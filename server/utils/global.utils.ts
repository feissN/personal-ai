export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const dataURLtoFile = (dataURL: string, filename: string) => {
    const arr = dataURL.split(",");
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], `${filename}.${mime.split("/")[1]}`, { type: mime });
};

export const fileToBase64 = (source: Blob) => {
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(source);
        reader.onloadend = () => {
            const base64String = reader.result as string;
            resolve(base64String);
        };
        reader.onerror = reject;
    });
};

export const fileToBinary = (source: Blob) => {
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsBinaryString(source);
        reader.onloadend = () => {
            const base64String = reader.result as string;
            resolve(base64String);
        };
        reader.onerror = reject;
    });
};

export const base64toBlob = (base64Data: string, contentType: string) => {
    contentType = contentType || "";
    var sliceSize = 1024;
    var byteCharacters = atob(base64Data);
    var bytesLength = byteCharacters.length;
    var slicesCount = Math.ceil(bytesLength / sliceSize);
    var byteArrays = new Array(slicesCount);

    for (var sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
        var begin = sliceIndex * sliceSize;
        var end = Math.min(begin + sliceSize, bytesLength);

        var bytes = new Array(end - begin);
        for (var offset = begin, i = 0; offset < end; ++i, ++offset) {
            bytes[i] = byteCharacters[offset].charCodeAt(0);
        }
        byteArrays[sliceIndex] = new Uint8Array(bytes);
    }
    return new Blob(byteArrays, { type: contentType });
};

export const chunkArrayIntoPairs = <T>(array: T[]): T[][] => {
    const result: T[][] = [];

    for (let i = 0; i < array.length; i += 2) {
        result.push(array.slice(i, i + 2));
    }

    return result;
};
