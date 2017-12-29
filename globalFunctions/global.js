

global.prepareDateOnly = (d) => {
    d = new Date(d)
    month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
}

global.Hours = (date1, date2) => {
    date1 = new Date(date1)
    date2 = new Date(date2)
    var result = Math.abs(date1 - date2) / 36e5
    return Number(result);
}

