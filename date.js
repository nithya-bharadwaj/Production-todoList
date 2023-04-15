module.exports = getDate;

function getDate() {
    const today = new Date();
    const options = {

        day: 'numeric',
        month: 'long',
        year: 'numeric'

    };
    // var currentDay = today.getDay();
    // var day = "";
    // const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    // day = daysOfWeek[currentDay];
    const dayInotherFormat = today.toLocaleDateString("en-US", options);
    const day = dayInotherFormat.replace(',', '') + ', ' + today.toLocaleDateString('en-US', { weekday: 'long' });
    return day;
}