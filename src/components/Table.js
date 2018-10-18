import React, { Component } from 'react';
import { Link } from 'react-router-dom';
// import { Button } from 'antd';
class Table extends Component{
    // constructor(props){
    //   super(props);
    // }
    render(){
      const TableListData=this.props;
      const TableListTitle=()=>{
        const TableTitle=TableListData.title.map((item,i)=>
          <th key={i}>{item}</th>
        )
        return (
          <thead>
            <tr>
              {TableTitle}
              <th>Action</th>
            </tr>
          </thead>
        )
      }
      const TableListBody=()=>{
        const TableBody=TableListData.data.map((item,i) =>{
              const TableTitle_len=TableListData.title.map((itemj,j)=>{
                if(itemj === "Hostname"){
                  return  <td key={j} onClick={this.props._goDetailFun.bind(this,i)}><Link to={'/detailList/'+item[itemj]}>{item[itemj]}</Link></td>
                }
                return <td key={j}>{item[itemj]}</td>
              })
              return (
                <tr key={i}>
                  {TableTitle_len}
                  <td>
                    <a onClick={this.props._editFun.bind(this,i)}  className="actionEd" size="small">Edit</a>
                    <a onClick={this.props._delFun.bind(this,i)} className="actionEdl" size="small">Delete</a>
                  </td>
                </tr>
              )
        })
        return (
          <tbody>
            {TableBody}
          </tbody>
        )
      }
      return(
        <table border="1">
          <TableListTitle/>
          <TableListBody/>
        </table>
      )
    }
  }

  export default Table;