var functions = {};
functions.pad = function (n, width, z) {
    'use strict';
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
};

functions.format_phone = function (phone) {
    'use strict';
    var area   = phone.substr(0, 3),
        middle = phone.substr(3, 3),
        last   = phone.substr(4, 4);

    return "(" + area + ") " + middle + "-" + last;
};

functions.subtract_array = function (big_arr, small_arr) {
    'use strict';
    var c = [];
    for (var i = 0, big_arr_length = big_arr.length; i < big_arr_length; i++) {
        //if(!small_arr.includes(big_arr[i])) {
        //    c.push(big_arr[i]);
        //}

        for (var j = 0, small_arr_length = small_arr.length; j < small_arr_length; j++) {
            if (big_arr[i] === small_arr[j]) {
                break;
            } else if ((j + 1) === small_arr_length) {
                c.push(big_arr[i]);
            }
        }
    }

    return c;
};

module.exports = functions;