import React from 'react';
export const ResponsiveContainer=({children})=>React.createElement('div',{style:{width:'100%',height:320}},children);
export const BarChart=({children})=>React.createElement('svg',{width:'100%',height:'100%',viewBox:'0 0 600 320'},children);
export const Bar=()=>React.createElement('rect',{x:40,y:80,width:480,height:180,rx:8,fill:'#059669',opacity:.25});
export const CartesianGrid=()=>React.createElement('g',null);
export const XAxis=()=>React.createElement('text',{x:40,y:300,fill:'currentColor'},'Produk');
export const YAxis=()=>React.createElement('text',{x:8,y:30,fill:'currentColor'},'Stok');
export const Tooltip=()=>null;
