const axios = require("axios");
const fs = require("fs");
const sha1 = require("sha1");
const request = require('request');

const url = "https://api.codenation.dev/v1/challenge/dev-ps/generate-data?token=54750cbf19233360dcd5290038009ef6c4c34dc8";
const alphabet = {
    1: 'a',
    2: 'b',
    3: 'c',
    4: 'd',
    5: 'e',
    6: 'f',
    7: 'g',
    8: 'h',
    9: 'i',
    10: 'j',
    11: 'k',
    12: 'l',
    13: 'm',
    14: 'n',
    15: 'o',
    16: 'p',
    17: 'q',
    18: 'r',
    19: 's',
    20: 't',
    21: 'u',
    22: 'v',
    23: 'w',
    24: 'x',
    25: 'y',
    26: 'z'
}

const getData = async url => {
    const response = await axios.get(url);
    const data = response.data;
    fs.writeFile("answer.json", JSON.stringify(data), (err) => {
        if (err) {
            throw err;
        }
    });
};

const readFile = file => new Promise((resolve, reject) => {
    fs.readFile(file, (err, contents) => {
        if (err) {
            reject(err);
        } else {
            resolve(JSON.parse(String(contents)));
        }
    });
});

const updateFile = (file, content) => new Promise((resolve, reject) => {
    fs.unlinkSync(file);
    fs.writeFile(file, JSON.stringify(content), (err) => {
        if (err) {
            reject(err);
        } else {
            resolve("Arquivo atualizado");
        }
    });
});


function decrypt(encrypted, key) {

    var decrypted = "";
    let chars = encrypted.split('');

    chars.map(char => {
        if (Object.values(alphabet).includes(char)) {
            indice = parseInt(Object.keys(alphabet).filter(key => {
                return alphabet[key] == char;
            }));
            correto = indice - key
            if (correto < 1) {
                correto = (indice - key) * -1;
                correto = 26 - correto;
            }

            decrypted = decrypted.concat(alphabet[correto]);
        } else {
            decrypted = decrypted.concat(char);
        }
    });
    return decrypted;

}

function sendAnswer(file, answerUrl) {
    let req = request.post(answerUrl, function (err, resp, body) {
        if (err) {
            console.log(err);
        } else {
            console.log('Nota: ' + body);
        }
    });
    let form = req.form();
    form.append('answer', fs.createReadStream(file));

}

const execute = async () => {
    await getData(url);
    let content = await readFile('answer.json');
    content.decifrado = decrypt(content.cifrado, content.numero_casas);
    content.resumo_criptografico = sha1(content.decifrado);
    await updateFile('answer.json', content);
    sendAnswer('answer.json', 'https://api.codenation.dev/v1/challenge/dev-ps/submit-solution?token=54750cbf19233360dcd5290038009ef6c4c34dc8');
};

execute();  