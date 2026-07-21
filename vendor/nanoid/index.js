export const nanoid=(n=21)=>Math.random().toString(36).slice(2,2+n); export const customAlphabet=()=>nanoid;
