let fs = require("fs");

let NEW_ABI_MAP;
let NEW_IERC20;
let CONTRACT;
let RPC = {
	"420666": "https://testnet.kekchain.com",
	"420420": "https://kekchain.interchained.org",
	"44444": "https://rpc-02.frenscan.io",
	"444": "https://rpc-01tn.frenchain.app",
	"56": "https://bsc-dataseed.binance.org/",
	"97": "https://data-seed-prebsc-1-s3.binance.org:8545",
	"5": "https://goerli.infura.io/v3/",
	"1": "https://mainnet.infura.io/v3/"
};
let CHAINS = {
	"tKEK": 420666,
	"KEK": 420420,
	"tFREN": 44444,
	"FREN": 444,
	"tBSC": 97,
	"BSC": 56,
	"GOERLI": 5,
	"ETH": 1
};

const readDir = async function(dir,stacks,check){
	let files_;
	let pending = await fs.readdir(dir, 
      { withFileTypes: true },
      async (err, files) => {
      	if(err){ console.log("err: ",err); } else {
      		files_=files;
			for(const file_ in files_){
				if(files_[file_]["name"].slice(-5) == ".json"){
			    	let abi_file = files_[file_]["name"];
			    	let filename = abi_file.replace('.json', '');
			    	let contracts = [];
			    	switch(filename){
			    		case "Staking_TOKEN":
			    			contracts.push(stacks[0].StakingToken)
			    			contracts.push(stacks[1].StakingToken)
			    			break;
			    		case "Stake_TOKEN":
			    			contracts.push(stacks[0].StakeToken)
			    			contracts.push(stacks[1].StakeToken)
			    			break;
			    		case "iStack_ABI":
			    			contracts.push(stacks[0].StakeToken)
			    			contracts.push(stacks[1].StakeToken)
			    			break;
			    		case "abi_test":
			    			contracts.push(stacks[0])
			    			contracts.push(stacks[1])
			    			break;
			    		case "ERC20":
			    			contracts.push(stacks[0])
			    			contracts.push(stacks[1])
			    			break;
			    		case "Masterchef":
			    			contracts.push(check["masterchef"])
			    			contracts.push(check["masterchef"])
			    			break;
			    		case "iBatch":
			    			contracts.push(stacks[0])
			    			contracts.push(stacks[1])
			    			break;
			    		case "iBridgeVault":
			    			contracts.push(stacks[0])
			    			contracts.push(stacks[1])
			    			break;
			    		case "iDeploy_MGR_ABI":
			    			contracts.push(stacks[0])
			    			contracts.push(stacks[1])
			    			break;
			    		case "iFaucet_ABI":
			    			contracts.push(stacks[0].Faucet)
			    			contracts.push(stacks[1].Faucet)
			    			break;
			    		case "iFaucet_TOKEN_ABI":
			    			contracts.push(stacks[0].FaucetToken)
			    			contracts.push(stacks[1].FaucetToken)
			    			break;
			    		case "iSplitter":
			    			contracts.push(stacks[0])
			    			contracts.push(stacks[1])
			    			break;
			    		case "iStack_TOKEN":
			    			contracts.push(stacks[0].StakeToken)
			    			contracts.push(stacks[1].StakeToken)
			    			break;
			    		case "MGR_ABI":
			    			contracts.push(stacks[0].Manager)
			    			contracts.push(stacks[1].Manager)
			    			break;
			    		case "Rewards_ABI":
			    			contracts.push(stacks[0].RewardsPool)
			    			contracts.push(stacks[1].RewardsPool)
			    			break;
			    		default: 
			    			break;
			    	};
			    	let checked = false;
					if (!fs.existsSync("./html/"+process.argv[2].toString()+"/"+filename)){
						checked = true;
						await fs.mkdirSync("./html/"+process.argv[2].toString()+"/"+filename);
					} else {
						checked = true;
					};
					exports.abi_mapper(filename,dir+abi_file,contracts,check);
				};
		    };
      	};
      });
    return files_;
};

const readFile = async function(file){
    let pending = await fs.readFileSync(file);
    try {
        pending = JSON.parse(pending);
    } catch(err) {
        console.log("Error",err);
    };
    return pending;
};

const writeFile = async function(file,data,isJson){
	let jsonString;
	if(isJson){
	    jsonString = JSON.stringify(data);
	} else {
	    jsonString = data;
	}
    fs.writeFile(file, jsonString, err => {
        if (err) {
            console.log('Error writing file', err)
        };
    });
};

exports.abi_mapper = async (filename,abi_file,contracts,check)=> {
	let chain_process = check["chain_process"];
	let contract_process = check["contract_process"];
	let rpc = check["rpc"];
	let abi_to_map = await readFile(abi_file.toString());
	let abi = [];
	for( const type in abi_to_map){
		let abi_ = {
			"name":"",
			"inputs":[],
			"outputs":[],
			"payable":false,
			"contracts":contracts,
			"input_length": 0,
			"input_able": false
		};
		if(abi_to_map[type]["type"] == "function"){
			abi_.name=abi_to_map[type]["name"];
			abi_.inputs.push(abi_to_map[type]["inputs"]);
			abi_.outputs.push(abi_to_map[type]["outputs"]);
			abi_.payable=abi_to_map[type]["stateMutability"];
			let inputs_ = abi_to_map[type]["inputs"];
			if(inputs_.length>0){ 
				abi_.input_length=inputs_.length;
				abi_.input_able=true;
			} else { 
				abi_.input_able=false;
			};
			abi.push(abi_);
		};
	};
	let arr_html = []; let arr_js = [];
	for( const function_ in abi){
		let inserts; let js_inserts; let contracts_inserts; 
		 let html = ""; let base_js = "";
		if(abi[function_]["input_able"] == true || abi[function_]["input_able"].toString() == "true") {
			inputs_ = abi[function_]["inputs"];
			let inputs_content = ""; let inputs___ = [];
			let buttons_content = ""; let buttons___ = [];
			let x = 0;
			let amps = [];
			while(x<inputs_.length){
				if(abi[function_]["inputs"][x][x]["name"].length>0){
					console.log("inputs_[x]: ",abi[function_]["inputs"][x][x]["name"]);
					amps.push(abi[function_]["inputs"][x][x]["name"]);
				    inputs_content+='<input id="'+abi[function_]["inputs"][x][x]["name"]+'_'+abi[function_]["name"]+'" class="'+abi[function_]["inputs"][x][x]["name"]+'_'+abi[function_]["name"]+'" type="number" name="amount" />'+'\n';
				};
				if(x==inputs_.length-1){
					buttons_content+='<input id="btn-send'+'_'+abi[function_]["name"]+'" class="btn-send'+'_'+abi[function_]["name"]+'" type="button" value="'+abi[function_]["name"]+'" />';
			        html+='<h1><span id="header_description" class="text-gradient">'+abi[function_]["name"]+'</span></h1> \n \
					<br> \n \
					<div class="col-12" id="col_inputs'+'_'+abi[function_]["name"]+'" class="col_inputs'+'_'+abi[function_]["name"]+'"> \n  \
			        <span id="inputs_panel" class="inputs_panel"> \n  \
			        	<span id="inputs_row" class="inputs_row"> \n  \
			        	'+inputs_content+' \n \
			          	</span> \n  \
			          	'+buttons_content+' \n \
			          </span> \n  \
			        </div> \n \
			        <div class="divider"></div>';
			        base_js = "";
			        for(const amp in amps){
			        	if(amps[amp].length > 0){
							let new_js = "const handleSendTransaction = async(amount)=> { let contract = $('#input-contract').val(); let rpc = $('#input-rpc').val(); console.log('web3: ',amount,'contract: ',contract, 'rpc: ',rpc); let web3 = new Web3(rpc); if(window.ethereum !== undefined){ console.log('ethereum',window.ethereum); const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' }); account = accounts[0]; console.log(account); }; }; \n \
							const defaultAmount"+"_"+amps[amp]+'_'+abi[function_]["name"]+" = 0.01; \n \
								const defaultAddress"+"_"+amps[amp]+'_'+abi[function_]["name"]+" = '0x1db4b4ed3803e55e22b05d73097c0a2440d29af6'; \n \
								const inputAmount"+"_"+amps[amp]+'_'+abi[function_]["name"]+" = document.getElementById('"+amps[amp]+'_'+abi[function_]["name"]+"'); \n \
								inputAmount"+"_"+amps[amp]+'_'+abi[function_]["name"]+".setAttribute('value', defaultAmount"+"_"+amps[amp]+'_'+abi[function_]["name"]+"); \n \
								document.getElementById('btn-send"+'_'+abi[function_]["name"]+"').onclick = function() { \n \
								  let amount"+"_"+amps[amp]+'_'+abi[function_]["name"]+" = inputAmount"+"_"+amps[amp]+'_'+abi[function_]["name"]+".value ? inputAmount"+"_"+amps[amp]+'_'+abi[function_]["name"]+".value : defaultAmount"+"_"+amps[amp]+'_'+abi[function_]["name"]+"; \n \
								  handleSendTransaction(amount"+"_"+amps[amp]+'_'+abi[function_]["name"]+"); \n \
								};";
								base_js+=new_js+"\n";
			        	};
			        };
					break;
				} else {
					x++;
				};
			};
		} else {
	        html = '<h1><span id="header_description" class="text-gradient">'+abi[function_]["name"]+'</span></h1> \n \
			<br> \n \
			<div class="col-12" id="col_inputs'+'_'+abi[function_]["name"]+'" class="col_inputs'+'_'+abi[function_]["name"]+'"> \n  \
	        <span id="inputs_panel" class="inputs_panel"> \n  \
	            <h2 id="header_title'+'_'+abi[function_]["name"]+'" class="header_title'+'_'+abi[function_]["name"]+'">'+abi[function_]["name"]+'</h2> \n  \
	            <input onclick="get_web3();" id="btn-send'+'_'+abi[function_]["name"]+'" class="btn-send'+'_'+abi[function_]["name"]+'" type="button" value="'+abi[function_]["name"]+'" /> \n  \
	          </span> \n  \
	        </div> \n \
	        <div class="divider"></div>';
			base_js = "const handleSendTransaction = async(amount)=> { let contract = $('#input-contract').val(); let rpc = $('#input-rpc').val(); console.log('web3: ',amount,'contract: ',contract, 'rpc: ',rpc);  }; \n \
			const defaultAmount"+"_"+abi[function_]["name"]+" = 0.01; \n \
				const defaultAddress"+"_"+abi[function_]["name"]+" = '0x1db4b4ed3803e55e22b05d73097c0a2440d29af6'; \n \
				document.getElementById('btn-send"+"_"+abi[function_]["name"]+"').onclick = function() { \n \
				  let amount"+"_"+abi[function_]["name"]+" = inputAmount"+"_"+abi[function_]["name"]+".value ? inputAmount"+"_"+abi[function_]["name"]+".value : defaultAmount"+"_"+abi[function_]["name"]+"; \n \
				  let address"+"_"+abi[function_]["name"]+" = inputAddress"+"_"+abi[function_]["name"]+".value ? inputAddress"+"_"+abi[function_]["name"]+".value : defaultAddress"+"_"+abi[function_]["name"]+"; \n \
				  handleSendTransaction(amount"+"_"+abi[function_]["name"]+", address"+"_"+abi[function_]["name"]+"); \n \
				};";
		};
        arr_html.push(html);
        arr_js.push(base_js);
        inserts=html;
		let base_html = '<!DOCTYPE html> \n \
			<html> \n \
			  <head> \n \
			    <title id="webtitle">Hello World!</title> \n \
			    <meta charset="utf-8"> \n \
			    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no"> \n \
			    <script src="https://code.jquery.com/jquery-3.2.1.slim.min.js"></script> \n \
				<script src="https://cdn.jsdelivr.net/npm/web3@latest/dist/web3.min.js"></script> \n \
			    <link href="https://fonts.googleapis.com/css?family=DM+Sans:wght@4000&display=swap" rel="stylesheet"> \n \
			    <link href="../example.css" rel="stylesheet"> \n \
			  </head> \n \
			  <body> \n \
			    <div class="container"> \n \
			      <img alt="logo" class="logo" id="logo" src="../icon.png"/> \n \
			      <h1 id="header_title" class="header_title">Made with ❤️</h1> \n \
			      <div class="divider"></div> \n \
			      <h1><span id="contract_address" class="text-gradient">Contract Address</span></h1> \n \
	  	            <input id="input-contract" class="input-contract" type="text" name="contract" /> \n \
			      <h1><span id="rpc_address" class="text-gradient">RPC Address</span></h1> \n \
	  	            <input id="input-rpc" class="input-rpc" type="text" name="rpc" /> \n \
			      <div class="row" id="row_inputs" class="row_inputs"> \n \
			      ' + inserts + ' \n \
			      </div> \n \
			    </div> \n \
			  </body> \n \
			  <script src="./'+abi[function_]["name"]+'_example.js"></script> \n \
			</html>';
			await writeFile("./html/"+process.argv[2].toString()+"/"+filename+"/"+abi[function_]["name"]+"_example.html",base_html, false);
			await writeFile("./html/"+process.argv[2].toString()+"/"+filename+"/"+abi[function_]["name"]+"_example.js",base_js, false);
	};

	inserts = ""; js_inserts = ""; contracts_inserts = ""; let contract_buttons = [];
	contract_buttons.push('<input id="contract_button_chain_a" class="contract_button_chain_a" type="button" value="'+contracts[0]+'" placeholder="'+contracts[0]+'" />');
	contract_buttons.push('<input id="contract_button_chain_b" class="contract_button_chain_b" type="button" value="'+contracts[1]+'" placeholder="'+contracts[1]+'" />');
	for( const contract_ in contract_buttons){
		contracts_inserts += "\n"+contract_buttons[contract_];
	};
	for( const html_ in arr_html){
		inserts += "\n"+arr_html[html_];
	};
	for( const js_ in arr_js){
		js_inserts += "\n"+arr_js[js_];
	};
	base_js = js_inserts;
	let base_html = '<!DOCTYPE html> \n \
		<html> \n \
		  <head> \n \
		    <title id="webtitle">Hello World!</title> \n \
		    <meta charset="utf-8"> \n \
		    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no"> \n \
			    <script src="https://code.jquery.com/jquery-3.2.1.slim.min.js"></script> \n \
				<script src="https://cdn.jsdelivr.net/npm/web3@latest/dist/web3.min.js"></script> \n \
		    <link href="https://fonts.googleapis.com/css?family=DM+Sans:wght@4000&display=swap" rel="stylesheet"> \n \
		    <link href="../example.css" rel="stylesheet"> \n \
		  </head> \n \
		  <body> \n \
		    <div class="container"> \n \
		      <img alt="logo" class="logo" id="logo" src="../icon.png"/> \n \
		      <h1 id="header_title" class="header_title">Made with ❤️</h1> \n \
		      <div class="divider"></div> \n \
  	            <input id="input-contract" class="input-contract" type="text" name="contract" /> \n \
  	            <input id="input-rpc" class="input-rpc" type="text" name="rpc" /> \n \
		      <div class="row" id="row_inputs" class="row_inputs"> \n \
		      ' + inserts + ' \n \
		      </div> \n \
		    </div> \n \
		  </body> \n \
		  <script src="./'+filename+"/"+'new_example.js"></script> \n \
		</html>';
		await writeFile("./html/"+filename+"/"+"new_example.html",base_html, false);
		await writeFile("./html/"+filename+"/"+"new_example.js",base_js, false);

};

exports.initialize = async (abi_dir)=>{ 
	let _iStack = await readFile("./iStack.json");
	let _iStack_CrossChain = await readFile("./iStack_CrossChain.json");
    let iStack = {
        "StakeToken": _iStack.StakeToken,
        "StakingToken": _iStack.StakingToken,
        "RewardsToken": _iStack.RewardsToken,
        "RewardsPool": _iStack.RewardsPool,
        "Faucet": _iStack.Faucet,
        "FaucetToken": _iStack.FaucetToken,
        "Manager": _iStack.Manager,
        "Governor": _iStack.Governor,
        "Operator": _iStack.Operator
    };
    let iStack_CrossChain = {
        "StakeToken": _iStack_CrossChain.StakeToken,
        "StakingToken": _iStack_CrossChain.StakingToken,
        "RewardsToken": _iStack_CrossChain.RewardsToken,
        "RewardsPool": _iStack_CrossChain.RewardsPool,
        "Faucet": _iStack_CrossChain.Faucet,
        "FaucetToken": _iStack_CrossChain.FaucetToken,
        "Manager": _iStack_CrossChain.Manager,
        "Governor": _iStack_CrossChain.Governor,
        "Operator": _iStack_CrossChain.Operator
    };
    let iMasterChef = {
		1: undefined,
		5: undefined,
		56: "0xbc33c8ad9756b669f5abfe6ce9b9cb132c3aff47",
		97: undefined,
		444: undefined,
		44444: undefined,
		420666: undefined,
		420420: undefined
	};
    let stacks = [iStack,iStack_CrossChain];
	let check = {
		"rpc": RPC[CHAINS[process.argv[2].toString()].toString()],
		"chain_process": process.argv[2] ? process.argv[2] : null,
		"contract_process": process.argv[3] ? process.argv[3] : null,
		"masterchef": RPC[CHAINS[process.argv[2].toString()].toString()]
	};
	let _data = parseFloat(CHAINS[process.argv[2].toString()]);
	console.log("chain_id: ",_data);
	let read_abi_dir = await readDir(abi_dir,stacks,check);
}; exports.initialize("./abi/");
