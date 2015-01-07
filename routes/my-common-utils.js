/**
 * Created by kojunghyun on 14. 12. 3..
 */
//-----------------------------------------------------------------------------
var my_utils={};

my_utils.getTimeStamp =  function () {
    var date = new Date();

    var ts =
        leadingZeros(date.getFullYear(), 4) + '-' +
        leadingZeros(date.getMonth() + 1, 2) + '-' +
        leadingZeros(date.getDate(), 2) + ' ' +

        leadingZeros(date.getHours(), 2) + ':' +
        leadingZeros(date.getMinutes(), 2) + ':' +
        leadingZeros(date.getSeconds(), 2);

    return ts;
};

function leadingZeros (n, digits) {
    var zero = '';
    n = n.toString();

    if (n.length < digits) {
        for (i = 0; i < digits - n.length; i++)
            zero += '0';
    }
    return zero + n;
};

module.exports = my_utils;