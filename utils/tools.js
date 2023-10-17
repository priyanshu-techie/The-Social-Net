const urlModule = require('url');

function modifyUrlForImageTransform(originalUrl) {
    let paths = urlModule.parse(originalUrl, true).path.split('/');
    let addition = "ar_1:1,c_fill,g_auto,r_max,w_1000"

    let finalUrl = "https://res.cloudinary.com"

    for (let index = 0; index < paths.length; index++) {
        if (index == 0) { continue; }
        if (index == 4) {
            finalUrl += '/'
            finalUrl += addition;
        }
        finalUrl += '/'
        finalUrl += paths[index];
    }
    return finalUrl;
}

module.exports= modifyUrlForImageTransform;