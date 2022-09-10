
$(document).ready(function () {
    $.ajax({
        url: '/api/tweets/getStreamedTweets',
        type: 'GET',
        contentType: "application/json; charset=utf-8",
        success: function (response) {                        // -- What happens on success
          myLive.addToSearch(response);
        },
        error:                                               // -- What happens on error and handling
          function (response) {
            console.log(response);
          }
      });
});