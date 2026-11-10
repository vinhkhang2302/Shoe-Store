const sizesByProductType = {
    1: ['39', '40', '41', '42', '43', '44', '45', '46', '47', '48', '49'],
    2: ['35', '36', '37', '38', '39', '40', '41', '42', '43'],
    3: Array.from({ length: 24 }, (_, index) => String(index + 16)),
};

export function getSizesForProductType(type) {
    return sizesByProductType[Number(type)] || sizesByProductType[3];
}
