
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
	//socket.emit('new',{data : ''});
})

function deleteSingle(id){
	socket.emit('delete_single', id);
}


socket.on('update', function(data) {
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
	/*if (d.rate > parseInt($('#table tr td:nth-child(2)')[0].innerHTML)) {
		$('#table').prepend('<tr id=' + d._id + '>' +
			'<td><b>' + d.name + '</b></td>' +
			'<td>' + d.rate + '</td>' +
			'<td>' +
			'<img id="vote" src="images/vote.png"/>&nbsp;' +
			'</td>' +
			'</tr>');
	} else if(d.rate < parseInt($('#table tr td:nth-child(2)')[ $('#table tr').length -1].innerHTML)){
		$('#table').append('<tr id=' + d._id + '>' +
			'<td><b>' + d.name + '</b></td>' +
			'<td>' + d.rate + '</td>' +
			'<td>' +
			'<img id="vote" src="images/vote.png"/>&nbsp;' +
			'</td>' +
			'</tr>');
	} else{
		$('<tr id=' + d._id + '>' +
			'<td><b>' + d.name + '</b></td>' +
			'<td>' + d.rate + '</td>' +
			'<td>' +
			'<img id="vote" src="images/vote.png"/>&nbsp;' +
			'</td>' +
			'</tr>').insertAfter($(td).parent());
	}
*/
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

		if(!name.match(/^[a-zA-Z]*$/) ){
			alert('Enter valid data');
			console.log(name);
			return false;
		} else if(isNaN(parseInt(score))){
			alert('Enter valid data');
			console.log(score);
			return false;
		} else{
			socket.emit('addnew', {name: name, rate: parseInt(score)});
			$("#addnewform").hide();
		}

	});
});

socket.on('disconnect', function() {
	console.log('disconnected..');
});
/*
function LeaderBoardCtrl($scope, $http) {

  $http({method: "GET", url: "/list"}).
  success(function(data, status, headers, config) {
	//console.log(status);
    $scope.users = data;
	//console.log(data);
	$.chartBar($scope.users);
  }).
  error(function(data, status, headers, config) {
	  console.log("err : "+status);
  });

  $scope.rating = function(id){

	  socket.emit('id', { user_id : id });

    }


  socket.on('update', function (data) {
	 	 $http({method: 'GET', url: '/list'}).
		  success(function(data2, status, headers, config) {
			  //console.log("data");
			$scope.users = data2;
			$.chartBar($scope.users);
			//console.log("ok server send data to angular scope");
		  }).
		  error(function(data2, status, headers, config) {
			  console.log("err : "+data2);
		  });
	});

	$scope.total = function(){
		var total=0;
		angular.forEach($scope.users, function(item){
			total+=item.rate;
        });
        return total;
	};

	$scope.highest = function(){
		var max=0;
		var high = [];
		angular.forEach($scope.users, function(item){
			high.push(item.rate);
        });
		max = Math.max.apply(Math,high);
        return max;
	};

}
*/