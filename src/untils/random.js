export default function () {
    return Math.random().toString(36).substring(0,30).replace(/\./gi, ''); 
}