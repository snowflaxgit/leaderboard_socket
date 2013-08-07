
var socket = io.connect(''); // socket connection

socket.on('connect',function(){

	$.ajax({
		'url' : '/list',
		'method' : 'GET',
		'success' : function(data){
			if(data){
				data.forEach(function(d){
					$('#table').append('<tr id=' + d._id + '>' +
						'<td><b>' + d.name + '</b></td>' +
						'<td>' + d.rate + '</td>' +
						'<td>' +
						'<img id="vote" src="images/vote.png"/>&nbsp;' +
						'</td>' +
						'</tr>');
				});
			}
		}
	});
})

/////////***************** Client side Socket On ********************///////////////
socket.on('clientOn', function(data) {
	
	var socketOnSwitch = data.option;
		switch(socketOnSwitch){
			case "update_score_ack":
				console.log(data.values);
				var td = $('#'+data.values._id).find('td')[1];
				$(td).html(data.values.rate);

			break;

			case "addnew_ack":
				var td = '';

				$('#table tr td:nth-child(2)').each(function() {
					if ($(this).text() == parseInt(data.values.rate)) {
						td = this;
					}
				});
				if ($("#table tr").length >= 10) {
					$('#table tr')[$('table tr').length - 1].remove();
				}
				$('#table').append('<tr id=' + data.values._id + '>' +
						'<td><b>' + data.values.name + '</b></td>' +
						'<td>' + data.values.rate + '</td>' +
						'<td>' +
						'<img id="vote" src="images/vote.png"/>&nbsp;' +
						'</td>' +
						'</tr>');

			break;

			default:


			break;
		}

});

$(document).ready(function() {
	$(".table").on('click', 'img',function(event){
		var id = $(event.target).parent().parent().attr('id');
		client_data_emmit('serverOn', {option:"update_score",values:{ user_id : id }});
	});

	$("#addnew").on('click', 'img', function(){
		if(document.getElementById('addnewform').style.display == 'none'){
			$('#addnewform').css('display', 'block');
		} else {
			$('#addnewform').css('display', 'none');
		}
	});

	$("#addnewbtn").click(function(){
		var name = $('#name').val();
		var score = $('#score').val();
		var date = new Date()

		if(!name.match(/^[a-zA-Z]*$/) ){
			alert('Enter valid data');
			console.log(name);
			return false;
		} else if(isNaN(parseInt(score))){
			alert('Enter valid data');
			console.log(score);
			return false;
		} else{

			client_data_emmit('serverOn', {option:"addnew",values:{name: name, rate: parseInt(score),date:new Date()}});

			$("#addnewform").hide();
		}

	});
});

socket.on('disconnect', function() {
	console.log('disconnected..');
});

//////////************** Client Side Socket Emmit *********////////////
function client_data_emmit(option,data){
	socket.emit(option, data);
}
