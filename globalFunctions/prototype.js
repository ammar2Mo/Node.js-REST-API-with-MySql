
// It receives a number of days and returns the new date time 

Date.prototype.addDays = function (days) {
    var num = parseInt(days)
    var dat = new Date(this.valueOf());
    dat.setDate(dat.getDate() + num);
    return dat;
}


// It receives a number of Hours and returns the new date time 

Date.prototype.addHours = function (h) {
    var num = parseInt(h)
    this.setTime(this.getTime() + (num * 60 * 60 * 1000));
    var h = new Date(this)
    return h;
}