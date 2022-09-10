$(document).ready(function(){

  // Cambio testo per procedere
  $("#twit_submit_btn").on('click', function(){
    var sendData = {
      consumer_key: '',
      consumer_secret : '',
      access_token : '',
      access_token_secret: ''
    };
    sendData.consumer_key = $('input[id="TC_key"]').val();
    sendData.consumer_secret = $('input[id="TCS_key"]').val();
    sendData.access_token = $('input[id="TAT_key"]').val();
    sendData.access_token_secret = $('input[id="TATS_key"]').val();
    
    $.ajax({
      url: '/api/keys',
      type: 'PUT',
      contentType: "application/json; charset=utf-8",
      data: JSON.stringify(sendData),
      success: function(response) {                        // -- What happens on success
        $('#TC_key').removeClass('is-invalid');
        $('#TCS_key').removeClass('is-invalid');
        $('#TAT_key').removeClass('is-invalid');
        $('#TATS_key').removeClass('is-invalid');
        $('#next_page_lbl').text("Proceed");
        $('#resP').css('color' , 'green');
        $('#resP').text('Keys saved successfully');
      },
      error:                                               // -- What happens on error and handling
      function(response) {
        if(response.responseJSON.msg === 'nullKeys'){      // -- What happens if sent keys are null
          var missing_keys = [];
          if(sendData.consumer_key === ''){
            missing_keys.push(' consumer key');
            $('#TC_key').addClass('is-invalid');
          } else {
            $('#TC_key').removeClass('is-invalid');
          }
          if(sendData.consumer_secret === ''){
            missing_keys.push(' consumer secret');
            $('#TCS_key').addClass('is-invalid');
          } else {
            $('#TCS_key').removeClass('is-invalid');
          }
          if(sendData.access_token === ''){
            missing_keys.push(' access token');
            $('#TAT_key').addClass('is-invalid');
          } else {
            $('#TAT_key').removeClass('is-invalid');
          }
          if(sendData.access_token_secret === ''){
            missing_keys.push(' access token secret');
            $('#TATS_key').addClass('is-invalid');
          } else {
            $('#TATS_key').removeClass('is-invalid');
          }
          var msgError = 'The';
          missing_keys.forEach(element => {
            if(element === missing_keys[missing_keys.length - 1]){
              msgError = msgError + element;
            } else {
              msgError = msgError + element + ',';
            }
          });
          if(missing_keys.length > 1){
            msgError = msgError + ' are';
          } else {
            msgError = msgError + ' is';
          }
          msgError = msgError + ' missing';
          $('#resP').css('color' , 'rgb(255,100,100)');
          $('#resP').text(msgError);
          $('#next_page_lbl').text("Proceed without keys");
        } else if(response.responseJSON.msg === 'spacyKeys'){           // -- What happens if sent keys contain spaces
          var spacy_keys = [];
          if(sendData.consumer_key.indexOf(' ') !== -1){
            spacy_keys.push(' consumer key');
            $('#TC_key').addClass('is-invalid');
          } else {
            $('#TC_key').removeClass('is-invalid');
          }
          if(sendData.consumer_secret.indexOf(' ') !== -1){
            spacy_keys.push(' consumer secret');
            $('#TCS_key').addClass('is-invalid');
          } else {
            $('#TCS_key').removeClass('is-invalid');
          }
          if(sendData.access_token.indexOf(' ') !== -1){
            spacy_keys.push(' access token');
            $('#TAT_key').addClass('is-invalid');
          } else {
            $('#TAT_key').removeClass('is-invalid');
          }
          if(sendData.access_token_secret.indexOf(' ') !== -1){
            spacy_keys.push(' access token secret');
            $('#TATS_key').addClass('is-invalid');
          } else {
            $('#TATS_key').removeClass('is-invalid');
          }
          var msgError = 'The';
          spacy_keys.forEach(element => {
            if(element === spacy_keys[spacy_keys.length - 1]){
              msgError = msgError + element;
            } else {
              msgError = msgError + element + ',';
            }
          });
          msgError = msgError + ' contain';
          if (spacy_keys.length < 2){
            msgError = msgError + 's';
          }
          msgError = msgError + ' spaces';
          $('#resP').css('color' , 'rgb(255,100,100)');
          $('#resP').text(msgError);
          $('#next_page_lbl').text("Proceed without keys");
        } else {                                                        // -- What happens if an unexpected error occurs or the server gives back an unexpected answer
          $('#resP').css('color' , 'rgb(255,100,100)');
          $('#resP').text('The Server couldn\'t receive or save the keys, plaese contact the site administrator');
          $('#next_page_lbl').text("Proceed without keys");
        }
      }
   });
    return false;
  });
});