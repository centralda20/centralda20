$(document).ready(()=>{
	initLogin();
});

var socket = io({reconnection: false});

var chave = false;

var show = (id) => {
	$("div[page=home]").hide();
	$("div[page=extrato]").hide();
	$("div[page="+id+"]").fadeIn(300);
}

var initLogin = () => {
	Swal.fire({
	  title: 'Informe sua chave de acesso',
	  input: "password",
	  showCancelButton: false,
	  inputAttributes: {
	     autocapitalize: "off",
	     maxlength: 32,
	     id: 'chave'
	  },
	  confirmButtonText: 'Autenticar',
	  showLoaderOnConfirm: true,
	  allowOutsideClick: false,
	  preConfirm: function(t) {
	      if (t.length != 32) {
	      	return Swal.showValidationMessage("Chave inválida")
	      }
	  },
	}).then((result) => {
	  if (result.isConfirmed) {
	    assignKey(result.value);
	  }
	});

	if (localStorage.getItem('chave') != undefined) {
		$('#chave').val(localStorage.getItem('chave'));
	}
}

var newInst = () => {
	socket.emit(`getCheckers`);
	//$("#exampleModalXl").modal("show");
};

var id_selecionado = false;
var nome_selecionado = false;

var newInstance = () => {
	var lista = $("#lista").val().split("\n");

	var total = lista.length;

	if (id_selecionado == false || nome_selecionado == false) {
		return;
	}

	var unique = lista.filter((v, i, a) => a.indexOf(v) === i);

	var total_unique  = unique.length;

	var repetidas = total - total_unique;

	unique_gl = repetidas;

	var captcha = $("#chave2captcha").val();

	socket.emit("newInstance", {lista: unique, id: id_selecionado, captcha: captcha});
}

var selecionar = (id, nome) => {
	id_selecionado = id;
	nome_selecionado = nome;

	var text = "Você selecionou: "+nome_selecionado + " | Insira sua lista";

	var current_Text = "";

	var count = 0;

	text.split('').forEach(async (letra) => {
		setTimeout(() => {
			current_Text = current_Text + letra;
			$("#exampleModalXlLabel").html(current_Text);
		}, count*25	);
		count++;
	});

	

	$("#step_1").hide();
	$("#step_2").fadeIn(300);
	$("#botaonext").fadeIn(300);

}

var showLoading = () => {
	Swal.fire({
	  imageUrl: 'loading.svg',
	  imageHeight: 100,
	  showConfirmButton: false,
	  allowOutsideClick: false
	});
}


socket.on(`disconnect`, (message) => {
	Swal.fire({
		title: "Desconectado",
		text: "Sua sessão expirou, logue novamente",
		showConfirmButton: false,
		allowOutsideClick: false
	});
});

socket.on(`checkers`, (message) => {

	$("#step_1").show();
	$("#step_2").hide();
	$("#botaonext").hide();
	$("#lista").val("");
	$('#exampleModalXlLabel').html("Escolha qual módulo você deseja");

	var lista_chks = [];

	message.forEach((chk)=>{
		lista_chks.push(`<div class="col-lg-4 mb-5" onclick='selecionar(${chk.id}, "${chk.nome}")'>
                                                              <div class="card card-raised">
                                                                <div class="card-body">
                                                                    <h2 class="card-title">${chk.nome}</h2>
                                                                    <p class="card-text">${chk.sobre}</p>
                                                                    <p><span class="badge bg-success">${chk.live}</span>&nbsp;<span class="badge bg-danger">${chk.die}</span></p>
                                                                </div>
                                                            </div>
                                                            </div>`)
	});

	$("#checkers").html(lista_chks.join("\n"));

	$("#exampleModalXl").modal("show");
});

var unique_gl = 0;

socket.on(`assignKey`, (message) => {
	if (message.error == true) {
		Swal.fire({
			title: message.message,
			icon: 'warning',
			showConfirmButton: true,
			confirmButtonText: 'tentar novamente',
        	showCancelButton: false,
			allowOutsideClick: false
		}).then(()=>initLogin());
	}else{
		showLoading();
		localStorage.setItem('chave', chave);
	}
});

socket.on(`newInstance`, (message) => {
	if (message.error == true) {
		Swal.fire({
			title: "Ops!",
			icon: 'warning',
			text: message.message
		});
	}else{
		Swal.fire({
			icon: "success",
			title: "Sucesso!",
			text: `Foi removido ${unique_gl} linhas repetidas da sua lista`
		});
	}
});

socket.on(`genPIX`, (message) => {
	if (message.error == true) {
		Swal.fire({
			title: "Ops!",
			icon: 'warning',
			text: message.message
		});
	}else{
		Swal.fire({
			icon: "success",
			title: "Sucesso!",
			text: `Abrindo página de pagamento...`
		});
		window.open(message.message, '_blank').focus();
		Swal.close();
	}
});

socket.on(`buyAdicional`, (message) => {
	if (message.error == true) {
		Swal.fire({
			title: "Ops!",
			icon: 'warning',
			text: message.message
		});
	}else{
		Swal.fire({
			icon: "success",
			title: "Sucesso!",
			text: message.message
		});
	}
});

var close_alert = true;


function download(id) {
  var str = $('#'+id).val();
  function dataUrl(data) {
    return "data:x-application/xml;charset=utf-8," + escape(data);
  }
  var downloadLink = document.createElement("a");
  downloadLink.href = dataUrl(str);
  downloadLink.download = id+".txt";
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
}

var getList = (id, type) => {
	socket.emit('getList', {id: id, type: type});
}

var pauseInst = (id) => {
	Swal.fire({
	  title: 'Confirme',
	  text: "Deseja interromper?",
  	  showDenyButton: true,
	  showCancelButton: false,
	  confirmButtonText: `Confirmo`,
	  denyButtonText: `Cancelar`,
	  customClass: {
	    confirmButton: "btn btn-success",
	    denyButton: 'btn btn-danger'
	  },
	}).then((result) => {
	  if (result.isConfirmed) {
	  	socket.emit('pauseInst', id);
	  }
	});
}

var genPIX = () => {
	Swal.fire({
	  title: 'Qual o valor ?',
	  input: "text",
	  showCancelButton: true,
	  inputAttributes: {
	     autocapitalize: "off",
	     maxlength: 7,
	     id: 'valor'
	  },
	  confirmButtonText: 'Gerar QRCODE',
	  showLoaderOnConfirm: true,
	  allowOutsideClick: true,
	}).then((result) => {
	  if (result.isConfirmed) {
	  	showLoading();
	    socket.emit('genPIX', result.value);
	  }
	});
};

var deleteInst = (id) => {
	Swal.fire({
	  title: 'Confirme',
	  text: "Deseja deletar?",
  	  showDenyButton: true,
	  showCancelButton: false,
	  confirmButtonText: `Confirmo`,
	  denyButtonText: `Cancelar`,
	  customClass: {
	    confirmButton: "btn btn-success",
	    denyButton: 'btn btn-danger'
	  },
	}).then((result) => {
	  if (result.isConfirmed) {
	  	socket.emit('deleteInst', id);
	  }
	});
}

socket.on('getList', async (message) => {
	if (message.error == true) {
		Swal.fire({
			icon: `warning`,
			text: message.message
		});
	}else{
		$("#listaInfo").val(message.message);
		$("#modalLivesLabel").html(message.title);
		$("#btnDl").attr("onclick", 'download("'+message.title+'")');
		$("#listInfo").modal("show");
	}
});

socket.on('pixReceived', async (message) => {
	Swal.fire({
		icon: `success`,
		text: "Depósito realizado com sucesso!"
	});
})

var limite_instancias = 0;
var limite_linhas = 0;

var addLimits = async () => {
	Swal.close();
	$("#buyMore").modal("show");

};

function timeConverter(UNIX_timestamp){
  var a = new Date(UNIX_timestamp);
  var year = a.getFullYear();
  var month = `0${a.getMonth()+1}`;
  var date = a.getDate();
  var hour = a.getHours();
  var min = a.getMinutes();
  var sec = a.getSeconds();
  var time = `${hour}h${min} ${date}/${month.substr(-2)}`
  return time;
}

var showAdicionais = () => {
	socket.emit('showAdicionais');
}

var buyNewInstance = () => {
	Swal.fire({
	  title: 'Comprar',
	  text: "+1 Instância por R$ 20. Expira em 7 dias",
  	  showDenyButton: true,
	  showCancelButton: false,
	  confirmButtonText: `Comprar`,
	  denyButtonText: `Cancelar`,
	  customClass: {
	    confirmButton: "btn btn-success",
	    denyButton: 'btn btn-danger'
	  },
	}).then((result) => {
	  if (result.isConfirmed) {
	  	socket.emit('buyAdicional', {ad: 1});
	  }
	});
}

var showLimits = () => {
	Swal.fire({
		icon: `info`,
		html: `<div class="card card-raised">
			    <div class="card-body">
			        <h2 class="card-title">Limite de Instâncias Em Andamento</h2>
			        <p class="card-text">${limite_instancias}</p>
			    </div>
			</div><div class="card card-raised">
			    <div class="card-body">
			        <h2 class="card-title">Limite de Linhas</h2>
			        <p class="card-text">${limite_linhas}</p>
			    </div>
			</div>`,
			footer: `<button class="btn btn-sm btn-success" onclick="addLimits()">Aumentar meus limites</button> &nbsp; <button class="btn btn-sm btn-primary" onclick="showAdicionais()">Meu adicionais ativos</button>`
	});
};

socket.on('showAdicionais', async (message) => {
	var adicionais = [];
	message.forEach((ad)=>{
		adicionais.push(`<div class="card-body">
			        <h2 class="card-title">+1 Instância</h2>
			        <p class="card-text">Comprado em: ${timeConverter(ad.hora_compra)} | Expira em: ${timeConverter(ad.hora_expira)}</p>
			    </div>`)
	})
	Swal.fire({
		icon: `success`,
		html: `<div class="card card-raised">${adicionais.join("\n")}</div>`,
	});
});

socket.on('pauseInst', async (message) => {
	if (message.error == true) {
		Swal.fire({
			icon: `warning`,
			text: message.message
		});
	}else{
		Swal.fire({
			icon: `success`,
			text: message.message
		});
	}
});

socket.on('deleteInst', async (message) => {
	if (message.error == true) {
		Swal.fire({
			icon: `warning`,
			text: message.message
		});
	}else{
		$("#"+message.id).fadeOut(200);
		Swal.fire({
			icon: `success`,
			text: message.message
		});
	}
});

socket.on('getList', async (message) => {
	if (message.error == true) {
		Swal.fire({
			icon: `warning`,
			text: message.message
		});
	}else{
		$("#listaInfo").val(message.message);
		$("#modalLivesLabel").html(message.title);
		$("#btnDl").attr("onclick", 'download("'+message.title+'")');
		$("#listInfo").modal("show");
	}
});

var confirmDelete = (opts) => {
	Swal.fire({
	  title: 'Escolha uma opção',
  	  showDenyButton: true,
	  showCancelButton: false,
	  confirmButtonText: `Manter a instância anterior`,
	  denyButtonText: `Deletar a instância anterior`,
	  customClass: {
	    confirmButton: "btn btn-success",
	    denyButton: 'btn btn-success'
	  },
	  footer: `<button class="btn btn-sm btn-danger" onclick="Swal.close()">Fechar</button>`
	}).then((result) => {
	  if (result.isConfirmed == true) {
	  	opts.delete = false;
	  	socket.emit('replayInst', opts);
	  }else if (result.isDenied == true) {
	  	opts.delete = true;
	  	socket.emit('replayInst', opts);
	  }
	});
}

var replayInst = (id) => {
	var captcha = $("#chave2captcha").val();
	Swal.fire({
	  title: 'Escolha uma opção',
  	  showDenyButton: true,
	  showCancelButton: false,
	  confirmButtonText: `Iniciar a partir da primeira linha`,
	  denyButtonText: `Iniciar de onde parou`,
	  customClass: {
	    confirmButton: "btn btn-success",
	    denyButton: 'btn btn-success'
	  },
	  footer: `<button class="btn btn-sm btn-danger" onclick="Swal.close()">Fechar</button>`
	}).then((result) => {
	  if (result.isConfirmed == true) {
	  	confirmDelete({id: id, tipo: 0, captcha: captcha});
	  }else if (result.isDenied == true) {
	  	confirmDelete({id: id, tipo: 1, captcha: captcha});
	  	//socket.emit('replayInst', {id: id, tipo: 1, captcha: captcha});
	  }
	});
}

socket.on('ping', async (message) => {
	var ext_html = [];

	message.extrato.forEach((ext) => {
		if (ext.debito == true) {var debito = "danger";}else{var debito = "success";};
		if (ext.debito == true) {var simbolo = "-";}else{var simbolo = "+";};
		ext_html.push(`
        <tr class="table-${debito}">
            <th scope="row">${simbolo} R$ ${ext.valor.toFixed(2)}</th>
            <td>${ext.titulo}</td>
            <td>${ext.data}</td>
        </tr>`)
	});

	if (ext_html.length == 0) {
		ext_html.push(`<tr class="table-info">
            <th scope="row">Nenhum registro por enquanto</th></tr>`);
	}

	$("#tableExtrato").html(ext_html.join("\n"));

	limite_instancias = message.limite_instancias;
	limite_linhas = message.lista_linhas;
	
	$("#onlines").html(message.online.length);
	$("#usuario").html(message.usuario);

	$("#saldo").html(`${message.saldo}`.split('.')[0]+"<sup>"+`${message.saldo}`.split('.')[1]+"</sup>");

	$("#aprovadas").html(message.lives);
	$("#reprovadas").html(message.dies);
	$("#instancias").html(message.instancias);
	$("#tooltip_onlines").attr("data-bs-original-title", message.online.join("\n"));

	var lista_instancias = [];

	message.lista_instancias.forEach((inst) => {
		var style = `<button onclick="pauseInst('${inst.id}')" class="btn btn-raised-warning btn-sm" style="color: white; ${style}" type="button"><i class="material-icons icon-sm">pause</i></button>&nbsp;`;
		var	style2 = "";
		if (inst.finalizada == true) {
			style = "";
			style2 = `<button onclick="replayInst('${inst.id}')" class="btn btn-raised-warning btn-sm" style="color: white;" type="button"><i class="material-icons icon-sm">replay</i></button>&nbsp;`;
		}

		lista_instancias.push(`<div class="col-md-4 mb-5" id="${inst.id}">
                                        <div class="card card-raised ripple-primary mb-5 mb-xl-0 mdc-ripple-upgraded">
                                    <div class="card-body">
                                        <div class="d-flex align-items-center">
                                            <div class="ms-1">
                                                <div class="fs-6 mb-2 fw-500">${inst.nome}</div>
                                                <span class="badge bg-success">${inst.lives}</span>&nbsp;<span class="badge bg-danger">${inst.dies}</span>&nbsp;<span class="badge bg-primary">${inst.total}</span>&nbsp;<span class="badge bg-secondary">${inst.status}</span>&nbsp;<span class="badge bg-info">${inst.data}</span><br>
                                                <span class="badge bg-dark">${inst.id}</span>
                                                <hr>
                                                <button onclick="getList('${inst.id}', 0)" class="btn btn-raised-success btn-sm" type="button"><i class="material-icons icon-sm">check</i></button>&nbsp;
                                                <button onclick="getList('${inst.id}', 1)" class="btn btn-raised-danger btn-sm" type="button"><i class="material-icons icon-sm">close</i></button>&nbsp;
                                                <button onclick="getList('${inst.id}', 2)" class="btn btn-raised-info btn-sm" style="color: white;" type="button"><i class="material-icons icon-sm">list</i></button>&nbsp;
                                                ${style}
                                                ${style2}
                                                <button onclick="deleteInst('${inst.id}')" class="btn btn-raised-danger btn-sm" type="button"><i class="material-icons icon-sm">delete</i></button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                    </div>`);
	});

	$("#lista_instancias").html(lista_instancias.join("\n"));
	if (close_alert == true) {
		$("#layoutDrawer").fadeIn(300);
		$("#nav").fadeIn(300);
		Swal.close();	close_alert = false;
	}
	
});

var assignKey = (key) => {
	chave = key;
	socket.emit('assignKey', key);
};