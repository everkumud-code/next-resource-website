const crypto=require('crypto');
const EMAIL='ever.kumud@gmail.com';
const PASSWORD_HASH='c12543a83d4c9b8832243f3a6e758865f4e3c9e92353bbafe7a193ffa9bfadd2';
const valid=(email,password)=>email===EMAIL&&crypto.createHash('sha256').update(String(password)).digest('hex')===PASSWORD_HASH;
module.exports={valid};
