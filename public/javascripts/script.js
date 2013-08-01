
var socket = io.connect(''); // socket connection

socket.on('connect',function(data){
	console.log(data);
	if (data) {
		data.forEach(function(d) {
			$('#table').append('<tr id=' + d._id + '>' +
				'<td><b>' + d.name + '</b></td>' +
				'<td>' + d.rate + '</td>' +
				'<td>' +
				'<img id="vote" src="images/vote.png"/>&nbsp;' +
				'</td>' +
				'</tr>');
		});
	}
})

function deleteSingle(id){
	socket.emit('delete_single', id);
}

socket.on('update_score_ack', function(data) {
	console.log(data);
	var td = $('#'+data._id).find('td')[1];
	$(td).html(data.rate);
});



socket.on('addnew_ack', function(d) {
	var td = '';

	$('#table tr td:nth-child(2)').each(function() {
		if ($(this).text() == parseInt(d.rate)) {
			td = this;
		}
	});
	if ($("#table tr").length >= 10) {
		$('#table tr')[$('table tr').length - 1].remove();
	}
	$('#table').append('<tr id=' + d._id + '>' +
			'<td><b>' + d.name + '</b></td>' +
			'<td>' + d.rate + '</td>' +
			'<td>' +
			'<img id="vote" src="images/vote.png"/>&nbsp;' +
			'</td>' +
			'</tr>');
});

socket.on('delete_single_ack', function(data){
	$('#'+data).remove();
});

$(document).ready(function() {
	$(".table").on('click', 'img',function(event){
		var id = $(event.target).parent().parent().attr('id');
		socket.emit('update_score', { user_id : id });
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

			socket.emit('addnew', {name: name, rate: parseInt(score),date:new Date()});

			$("#addnewform").hide();
		}

	});
});

socket.on('disconnect', function() {
	console.log('disconnected..');
});
