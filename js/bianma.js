const s = 'Java Script 世界'
console.log('escape_s', escape(s));       // Java%20Script%20%u4E16%u754C
console.log('encodeURI_s', encodeURI(s)); // Java%20Script%20%E4%B8%96%E7%95%8C

const url = "https://fanyi.baidu.com/?aldtype=16047#zh/en/%E9%98%BB%E5%A1%9E";
console.log('encodeURI_url', encodeURI(url));
// https://fanyi.baidu.com/?aldtype=16047#zh/en/%25E9%2598%25BB%25E5%25A1%259E
console.log('encodeURIComponent_url', encodeURIComponent(url));
// https%3A%2F%2Ffanyi.baidu.com%2F%3Faldtype%3D16047%23zh%2Fen%2F%25E9%2598%25BB%25E5%25A1%259E
