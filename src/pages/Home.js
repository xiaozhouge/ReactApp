import React, { Component } from 'react'
import '../less/Home.less';
import TableInput from '../components/TableInput';
import { Button, Input, Icon, Modal, Select, message } from 'antd';
import $Ajax from '../utils/ajax.js'
const Option = Select.Option;
let serverList = [];//临时router server 缓存数据用

export default class Home extends Component {
	constructor() {
		super()
		this.state = {
			fileList: [{ filename: 'mock_Infrastructure1' }, { filename: 'mock_Infrastructure2' }, { filename: 'mock_Infrastructure3' }],//左侧的file列表
			tableTitle: ["Role", "IP", "Hostname", 'ServerId', 'NodeId', "TransportProtocol", "network", "RsslPort", "RRCP Mode"],//table的title
			serverTitle: ["name", "serviceId"],//server的title
			serverDate: [],//server 的数据
			routeTitle: ["AppServiceName", "RouteName", "Port", "Address", "ServiceName"],//router title
			routeDate: [],// router Data
			tableDate: [],//table Data
			visible: false,//控制modal是否隐藏 
			ADHs: 1,//add几条ADH，默认是1
			ADSs: 1,//add几条ADS,默认是1
			isEditing: null,//正在编辑的是哪个
			filename: '',//filename
			isViewMode: false,//addNew的moal
			visibleSaveAs: false,//saveAs出现的modal
		}
		// "AppServiceName":"RED3_ELEKTRON_EDGE_LDN",
		// "RouteName":"route1",
		// "Address":"10.42.91.12",
		// "Port":"rmds_rssl_sink",
		// "ServiceName":"ELEKTRON_DD",
		this.textInput = React.createRef();
		this.serverInput = React.createRef();
		this.routerInput = React.createRef();
	}
	//新增机器配置
	addNew() {
		this.setState({
			visible: true,
		});
	}
	handleOkSaveAs = (e) => {
		this.setState({
			visibleSaveAs: false,
		});
		this.save();
		message.success('save success', 2);
	}
	handleCancelSaveAs = (e) => {
		// console.log(e);
		this.setState({
			visibleSaveAs: false,
		});
		message.warning('save fail', 2);
	}
	//modal
	handleOk = (e) => {
		// console.log(e);
		let tableDate = this.state.tableDate;
		console.log(this.state.ADHs,this.state.ADSs)
		tableDate = [];
		for (let i = 0; i < this.state.ADHs; i++) {
			tableDate.push({
				"Role": "ADH",
				"IP": '',
				"Hostname": "",
				"ServerId": "",
				"NodeId": "",
				"TransportProtocol": "MultiCast",
				"network": '',
				"RsslPort": "",
				"RRCPMode": 'RRCP'
			})
		}
		for (let i = 0; i < this.state.ADSs; i++) {
			tableDate.push({
				"Role": "ADS",
				"IP": '',
				"Hostname": "",
				"ServerId": "",
				"NodeId": "",
				"TransportProtocol": "MultiCast",
				"network": '',
				"RsslPort": "",
				"RRCPMode": 'RRCP'
			})
		}
		serverList = [];
		this.setState({
			visible: false,
			tableDate: tableDate,
			filename: '',
			serverDate: [],
			routeDate: [],
			isViewMode: false
		});
	}
	//modal
	handleCancel = (e) => {
		// console.log(e);
		this.setState({
			visible: false,
		});
	}
	componentDidMount () {
		this.initFileList()
	}
	initFileList=async()=>{
		let TOKEN = sessionStorage.getItem("TOKEN")
		let list=await $Ajax("infraFileList?token=" + TOKEN, "POST");
		this.setState({
			fileList:list
		})
	}
	//input的数值太多，所以用非绑定的方式，次方法用来收集所以input的数值
	inputsDataDeal(target) {
		let tmpData, tableTitle;
		if (target === "table") {
			tmpData = this.textInput.current.children;
			tableTitle = this.state.tableTitle;
		} else if (target === "server") {
			tmpData = this.serverInput.current.children;
			tableTitle = this.state.serverTitle;
		} else if (target === "router") {
			tmpData = this.routerInput.current.children;
			tableTitle = this.state.routeTitle;
		}
		let tmpArr = [];
		let tmp;
		for (let i = 0; i < tmpData.length; i++) {
			let tr = {};
			for (let j = target === "table" ? 1 : 0; j < tmpData[i].children.length; j++) {
				for (let k = 0; k < tmpData[i].children[j].children.length; k++) {
					if (tmpData[i].children[j].children[k].nodeName === "INPUT") {
						tmp = tmpData[i].children[j].children[k].value;
					} else {
						tmp = ""
					}
				}
				tr[tableTitle[j]] = tmp;
			}
			tmpArr.push(tr)
		}
		if (target === "table") {
			tmpArr.map((item, i) => item.Role = this.state.tableDate[i].Role)
		}
		return tmpArr
	}
	save = async () => {
		// console.log(serverList)
		//收取所有的数据
		let tableDate = [];
		this.inputsDataDeal("table").forEach((item, i) => {
			tableDate.push({
				"Role": item.Role,
				"IP": item.IP,
				"Hostname": item.Hostname,
				"ServerId": item.ServerId,
				"NodeId": item.NodeId,
				"TransportProtocol": item.TransportProtocol || this.state.tableDate[i]["TransportProtocol"],
				"network": item.network,
				"RsslPort": item.RsslPort,
				"RRCPMode": item.RRCPMode || this.state.tableDate[i]["RRCPMode"]
			})
		})
		//校验filename
		if (!this.state.filename) {
			message.warning('filename can\' be empty ', 2);
			return;
		}
		for (let i = 0; i < tableDate.length; i++) {
			let edit = i + 1 <= this.state.ADHs ? "ADH" + (i + 1) :
				this.state.ADHs === 2 ? "ADS" + (i - 1) : "ADS" + (i - this.state.ADHs + 2);
			if (serverList[i]) {
				tableDate[i].Service = serverList[i].server;
				tableDate[i].Route = serverList[i].router;
			}
			//校验有没有server和router
			if (edit.indexOf("ADS") < 0 && !tableDate[i].Service) {
				message.warning('server  of can\' be empty' + edit, 2);
				return;
			}
			if (edit.indexOf("ADS") < 0 && tableDate[i].Route.length === 0) {
				message.warning('route  of can\' be empty' + edit, 2);
				return;
			}
			//server的每一项
			
			if (edit.indexOf("ADS") < 0) {
				for (let j = 0; j < serverList[i].server.length; j++) {
					for (let item of Object.keys(serverList[i].server[j])) {
						if (!serverList[i].server[j][item]) {
							message.warning(item + '  of ' + edit + '(Service) can\' be empty', 2);
							return;
						}
					}
				}
				//router的每一项
				for (let k = 0; k < serverList[i].router.length; k++) {
					for (let item of Object.keys(serverList[i].router[k])) {
						if (!serverList[i].router[k][item]) {
							message.warning(item + '  of ' + edit + '(Route) can\' be empty', 2);
							return;
						}
					}
				}
			}

			//校验tableData(除了router和server)&&tableDate[i].RsslPort.indexOf("ADS")>0||item!=="RsslPort"
			for (let item of Object.keys(tableDate[i])) {
				if (item !== "Service" && item !== "Route") {
					if (!tableDate[i][item]) {
						 if ((tableDate[i].Role.indexOf("ADS") > -1 ||item !== "RsslPort")&&(tableDate[i].RRCPMode!=="RRCPDL"|| item !== "NodeId") ) {
									message.warning(item + '  of ' + edit + ' can\' be empty ', 2);
									return;
						}
					}
					//校验IP格式
					if (!(/^(?:(?:1[0-9][0-9]\.)|(?:2[0-4][0-9]\.)|(?:25[0-5]\.)|(?:[1-9][0-9]\.)|(?:[0-9]\.)){3}(?:(?:1[0-9][0-9])|(?:2[0-4][0-9])|(?:25[0-5])|(?:[1-9][0-9])|(?:[0-9]))$/.test(tableDate[i]["IP"]))) {
						message.warning('Please enter the correct IP of ' + edit, 2);
						return;
					}
					//校验ServerID  NodeID  port，必须为数字
					if (!(/^[0-9]*$/.test(tableDate[i]["ServerId"]))) {
						message.warning('ServerId must be number', 2);
						return;
					}
					if (!(/^[0-9]*$/.test(tableDate[i]["NodeId"]))) {
						message.warning('NodeId must be number', 2);
						return;
					}
				}
			}

		}

		let _postData = {
			"infraName": this.state.filename,
			"machines": tableDate
		}
		console.log(_postData)
		await $Ajax("saveDiagramInfr?token=" + sessionStorage.getItem('TOKEN'), "POST", _postData, 'application/json;charset=UTF-8');
		let f1=await $Ajax("infraFileList?token=" + sessionStorage.getItem('TOKEN'), "POST");
		this.setState({
			fileList:f1
		})
	}
	saveAs() {
		this.setState({
			visibleSaveAs: true
		})
		
	}
	//切换上面的ADS ADH是缓存下面的router和server的数据
	collectData = (target = "") => {
		if (target === "table") {
			let tmpTableDate = [];
			this.inputsDataDeal("table").forEach((item, i) => {
				tmpTableDate.push({
					"Role": item.Role,
					"IP": item.IP,
					"Hostname": item.Hostname,
					"ServerId": item.ServerId,
					"NodeId": item.NodeId,
					"TransportProtocol": item.TransportProtocol || this.state.tableDate[i]["TransportProtocol"],
					"network": item.network,
					"RsslPort": item.RsslPort,
					"RRCPMode": item.RRCPMode || this.state.tableDate[i]["RRCPMode"]
				})
			})
			this.setState({
				tableDate: tmpTableDate
			})
		} else {
			let serverDate = this.inputsDataDeal("server")
			let routeDate = this.inputsDataDeal("router")

			serverList[this.state.isEditing] = {
				"server": serverDate,
				"router": routeDate
			};
			this.setState({
				routeDate: serverList[this.state.isEditing].router,
				serverDate: serverList[this.state.isEditing].server,
			})
		}

	}
	//切换ADS ADH;来控制正在编辑的下表
	showEdit = (i) => {
		if (serverList[i]) {
			this.setState({
				routeDate: serverList[i].router,
				serverDate: serverList[i].server,
			})
		} else {
			this.setState({
				routeDate: [],
				serverDate: [],
			})
		}
		let tmpTableDate = [];
		this.inputsDataDeal("table").forEach((item, i) => {
			tmpTableDate.push({
				"Role": item.Role,
				"IP": item.IP,
				"Hostname": item.Hostname,
				"ServerId": item.ServerId,
				"NodeId": item.NodeId,
				"TransportProtocol": item.TransportProtocol || this.state.tableDate[i]["TransportProtocol"],
				"network": item.network,
				"RsslPort": item.RsslPort,
				"RRCPMode": item.RRCPMode || this.state.tableDate[i]["RRCPMode"]
			})
		})
		this.setState({
			isEditing: i,
			tableDate: tmpTableDate
		})
	}
	//添加一行数据
	addServer = (k, action) => {
		let serverDate = this.state.serverDate;
		let routeDate = this.state.routeDate;
		serverDate = this.inputsDataDeal("server")
		routeDate = this.inputsDataDeal("router")
		if (k === "server") {
			action === "add" ?
				serverDate.push({
					"name": '',
					"serviceId": ''
				})
				: serverDate.pop()
		} else {
			action === "add" ?
				routeDate.push({
					"AppServiceName": "",
					"RouteName": "",
					"Address": "",
					"Port": "",
					"ServiceName": "",
				})
				: routeDate.pop()
		}
		this.setState({
			serverDate: serverDate,
			routeDate: routeDate,
		})


	}
	changeName = (e) => {
		this.setState({
			filename: e.target.value
		})
	}
	changeRRCP = (e, i, v) => {
		console.log(e, i, v)
		let tmpTableDate = [];
		let tmp = this.inputsDataDeal("table");
		tmp[i][e] = v;
		tmp.forEach((item, i) => {
			tmpTableDate.push({
				"Role": item.Role,
				"IP": item.IP,
				"Hostname": item.Hostname,
				"ServerId": item.ServerId,
				"NodeId": item.NodeId,
				"TransportProtocol": item.TransportProtocol || this.state.tableDate[i]["TransportProtocol"],
				"network": item.network,
				"RsslPort": item.RsslPort,
				"RRCPMode": item.RRCPMode || this.state.tableDate[i]["RRCPMode"]
			})
		})
		this.setState({
			tableDate: tmpTableDate
		})

	}
	viewList=async (name)=> {
		// let tmpmockData = {
		// 	infraName: name,
		// 	machines: [
		// 		{
		// 			"Role": "ADH",
		// 			"IP": '192.80.40.197',
		// 			"Hostname": "google.com",
		// 			"ServerId": "111",
		// 			"NodeId": "111",
		// 			"TransportProtocol": "MultiCast",
		// 			"network": 'network',
		// 			"RsslPort": "123",
		// 			"RRCPMode": 'RRCP',
		// 			"Route": [
		// 				{
		// 					"AppServiceName": "RED3_ELEKTRON_EDGE_LDN",
		// 					"RouteName": "route1",
		// 					"Address": "10.42.91.12",
		// 					"Port": "rmds_rssl_sink",
		// 					"ServiceName": "ELEKTRON_DD",
		// 				},
		// 				{
		// 					"AppServiceName": "RED3_ELEKTRON_EDGE_LDN",
		// 					"RouteName": "route1",
		// 					"Address": "10.42.91.12",
		// 					"Port": "rmds_rssl_sink",
		// 					"ServiceName": "ELEKTRON_DD",
		// 				}
		// 			],
		// 			"Service": [
		// 				{
		// 					"name": 'server1',
		// 					"serviceId": '1101'
		// 				}
		// 			]
		// 		},
		// 		{
		// 			"Role": "ADS",
		// 			"IP": '127.0.0.1',
		// 			"Hostname": "baidu.com",
		// 			"ServerId": "22",
		// 			"NodeId": "222",
		// 			"TransportProtocol": "MultiCast",
		// 			"network": 'network',
		// 			"RsslPort": "123",
		// 			"RRCPMode": 'RRCP',
		// 			"Route": [
		// 				{
		// 					"AppServiceName": "RED3_ELEKTRON_EDGE_LDN",
		// 					"RouteName": "route1",
		// 					"Address": "10.42.91.12",
		// 					"Port": "rmds_rssl_sink",
		// 					"ServiceName": "ELEKTRON_DD",
		// 				}
		// 			],
		// 			"Service": [
		// 				{
		// 					"name": 'server1',
		// 					"serviceId": '1101'
		// 				}
		// 			]
		// 		},
		// 	]
		// };
		let tmpmockData ={"infraName":"2ADH1ADS","machines":[{"RsslPort":"","ServerId":"192","NodeId":"168","IP":"10.179.83.100","Hostname":"BJTREP100","Role":"ADH","Service":[{"name":"ELEKTRON_DD","serviceId":"123"}],"Route":[{"AppServiceName":"RED3_ELEKTRON_EDGE_LDN","RouteName":"route1","Address":"10.42.91.12","Port":"14002","ServiceName":"ELEKTRON_DD"}],"TransportProtocol":"MultiCast","RRCPMode":"RRCP","network":"192.168.3.0"},{"RsslPort":"","ServerId":"193","NodeId":"169","IP":"10.179.83.101","Hostname":"BJTREP101","Role":"ADH","Service":[{"name":"ELEKTRON_DD","serviceId":"123"}],"Route":[{"AppServiceName":"RED3_ELEKTRON_EDGE_LDN","RouteName":"route2","Address":"10.42.91.12","Port":"14002","ServiceName":"ELEKTRON_DD"}],"TransportProtocol":"MultiCast","RRCPMode":"RRCP","network":"192.168.3.0"},{"RsslPort":"14002","ServerId":"195","NodeId":"170","IP":"10.179.83.102","Hostname":"BJTREP102","Role":"ADS","network":"192.168.3.0","TransportProtocol":"MultiCast","RRCPMode":"RRCP"},{"RsslPort":"14002","ServerId":"196","NodeId":"171","IP":"10.179.83.103","Hostname":"BJTREP103","Role":"ADS","network":"192.168.3.0","TransportProtocol":"MultiCast","RRCPMode":"RRCP"}]}
		let mockData=name.indexOf("mock")>-1?tmpmockData:
		await $Ajax("infraFileInfo?token="+sessionStorage.getItem('TOKEN')+"&infrafile="+name,"POST");
		let tableData = [];
		serverList = [];
		let adhs = 0, adss = 0;
		mockData.machines.forEach((item, i) => {
			if (item.Role === "ADH") {
				adhs++
			} else {
				adss++
			}
			tableData.push({
				"Role": item.Role,
				"IP": item.IP,
				"Hostname": item.Hostname,
				"ServerId": item.ServerId,
				"NodeId": item.NodeId,
				"TransportProtocol": item.TransportProtocol,
				"network": item.network,
				"RsslPort": item.RsslPort,
				"RRCPMode": item.RRCPMode
			})
			serverList[i] = {};
			serverList[i].router = item.Route
			serverList[i].server = item.Service;
		})
		this.setState({
			filename: mockData.infraName,
			tableDate: tableData,
			isViewMode: true,
			ADHs: adhs,
			ADSs: adss,
			isEditing: null
		})
	}
	render() {
		const FileList = () => {
			let files = this.state.fileList;
			const fileItem = files.map((item, i) =>
				<li key={i} onClick={this.viewList.bind(this, item.filename)}>
					<Icon type="edit" />&nbsp;{item.filename}
				</li>
			)
			return (
				<ul>
					<li><Button onClick={this.addNew.bind(this)} type="primary" icon="plus">Add New</Button></li>
					{fileItem}
				</ul>
			)
		}
		function handleChange(e, value) {
			console.log(`selected ${e}${value}`);
			if (e === "ADH") {
				this.setState({
					ADHs: value
				})
			} else {
				this.setState({
					ADSs: value
				})
			}
		}
		return (
			<div className="Home">
				<Modal
					title="please select machines config"
					visible={this.state.visible}
					onOk={this.handleOk}
					onCancel={this.handleCancel}
				>
					<div className="modal">
						<div>ADH &nbsp;
							<Select value={this.state.ADHs} style={{ width: 120 }} onChange={handleChange.bind(this, "ADH")}>
								<Option value="1">1</Option>
								<Option value="2">2</Option>
							</Select>
						</div>
						<div>ADS &nbsp;
							<Select value={this.state.ADSs} style={{ width: 120 }} onChange={handleChange.bind(this, "ADS")}>
								<Option value="1">1</Option>
								<Option value="2">2</Option>
							</Select>
						</div>
					</div>
				</Modal>
				<Modal
					title="please enter a new filename"
					visible={this.state.visibleSaveAs}
					onOk={this.handleOkSaveAs}
					onCancel={this.handleCancelSaveAs}
				>
					<p>
						<label>
							<span>File name:</span>
							<Input placeholder="please enter a new filename" value={this.state.filename} onChange={this.changeName} />
						</label>
					</p>
				</Modal>
				<FileList />
				<div className="Likeword">
					<p className="savefile">
						<label><span>File name:</span><Input placeholder="please input file name" value={this.state.filename} onChange={this.changeName.bind(this)} /></label>
						<label>
							<Button type="primary" onClick={() => { this.save() }}>save</Button>
							{this.state.isViewMode && <Button type="primary" onClick={() => { this.saveAs() }}>save As</Button>}
						</label>
					</p>
					<TableInput _collectData={this.collectData.bind(this, "table")} _changeRRCP={this.changeRRCP} _showEdit={this.showEdit} textRef={this.textInput} data={this.state.tableDate} title={this.state.tableTitle}></TableInput>
					{this.state.isEditing !== null && <div className="serverAndRouter">
						<div>
							<Icon type="form" /> <span style={{ "fontSize": '16px', "fontWeight": '700' }}>You are is editing &nbsp;</span>
							<span style={{ "color": "#ff9100", "fontWeight": '700' }}>{
								this.state.isEditing + 1 <= this.state.ADHs ? "ADH" + (this.state.isEditing + 1) :
									this.state.ADHs === 2 ? "ADS" + (this.state.isEditing - 2) : "ADS" + (this.state.isEditing - this.state.ADHs + 1)
							}
							</span>
							<Button.Group style={{ "marginLeft": '30px' }}>
								<Button type="primary" onClick={this.addServer.bind(this, 'server', 'add')}>
									<Icon type="plus" />addService
								</Button>
								<Button type="danger" onClick={this.addServer.bind(this, 'server', 'del')}>
									deleteService<Icon type="delete" />
								</Button>
							</Button.Group>
							<Button.Group style={{ "marginLeft": '10px' }}>
								<Button type="primary" onClick={this.addServer.bind(this, 'router', 'add')}>
									<Icon type="plus" />addRoute
								</Button>
								<Button type="danger" onClick={this.addServer.bind(this, 'router', 'del')}>
									deleteRoute<Icon type="delete" />
								</Button>
							</Button.Group>
						</div>
						<TableInput _collectData={this.collectData} textRef={this.serverInput} data={this.state.serverDate} title={this.state.serverTitle}></TableInput>
						<TableInput _collectData={this.collectData} textRef={this.routerInput} data={this.state.routeDate} title={this.state.routeTitle}></TableInput>
					</div>}
				</div>
			</div>
		)
	}
}