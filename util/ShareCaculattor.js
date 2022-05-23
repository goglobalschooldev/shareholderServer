const moment = require("moment");

exports.GetFirstInvoice_ID = (length) => {
    // console.log(length)
    let Year = moment().format('YY');
    let Month = moment().format('MM');
    const getlength = length === 0 ? 1 : length + 1;

    var str = "" + getlength
    var pad = "00000"
    var ans = pad.substring(0, pad.length - str.length) + str
    return ans + Month + Year
}

exports.Get_Start_ID = (length, lastEndShareId, share_Value) => {
    let lastShareArray = [];
    lastEndShareId.forEach(element => {
        lastShareArray.push(element.end_Id)
    });
    const ShareIdwithZeroLegnth = {
        start: 1,
        end: share_Value
    }
    const ShareIdwithBiggerThen = {
        start: lastShareArray[0] + 1,
        end: lastShareArray[0] + share_Value
    }
    const final_Id = length === 0 ? ShareIdwithZeroLegnth : ShareIdwithBiggerThen

    return final_Id
}
