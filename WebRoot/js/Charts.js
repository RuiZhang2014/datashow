Ext.require('Ext.chart.*');
Ext.require(['Ext.layout.container.Fit', 'Ext.window.MessageBox']);

Ext.onReady(function() {

    var downloadChart = function(chart){
        Ext.MessageBox.confirm('Confirm Download', 'Would you like to download the chart as an image?', function(choice){
            if(choice == 'yes'){
                chart.save({
                    type: 'image/png'
                });
            }
        });
    };

    
    var myMask = new Ext.LoadMask(Ext.getBody(), {
    	msg    : "loading...",
    	msgCls : 'z-index:10000;'
    });
    
    var chart1 = Ext.create('Ext.chart.Chart',{
            animate: false,
            store: datastore,
            insetPadding: 30,
            axes: [{
                type: 'Numeric',
                minimum: 0,
                position: 'left',
                fields: ['rate'],
                title: true,
                grid: true,
                label: {
                   
                    font: '10px Arial'
                }
            }, {
                type: 'Category',
                position: 'bottom',
                fields: ['hour'],
                title: false,
                label: {
                    font: '11px Arial'
                    
                }
            },{
                type: 'Numeric',
                minimum: 0,
                position: 'right',
                fields: ['period'],
                title: true,
                grid: true,
                label: {
                   
                    font: '10px Arial'
                }
            }],
            series: [{
            	id : 'rateline',
                type: 'line',
                axis: 'left',
                xField: 'hour',
                yField: 'rate',
                
                tips: {
                    trackMouse: true,
                    width: 100,
                    height: 80,
                    renderer: function(storeItem, item) {
                        this.setTitle('hour : ' + storeItem.get('hour'));
                        this.update('rate : ' + storeItem.get('rate') + '<br/>' + 'period : ' + storeItem.get('period') + '<br/>'   + 'errors : ' + storeItem.get('numError'));
                    }
                },
                style: {
                    fill: '#38B8BF',
                    stroke: '#38B8BF',
                    'stroke-width': 1
                },
                markerConfig: {
                    type: 'circle',
                    size: 2,
                    radius: 2,
                    'stroke-width': 0,
                    fill: '#38B8BF',
                    stroke: '#38B8BF'
                }
            }, {
            	id : 'periodline',
            	
            	type: 'line',
            	axis: 'right',
            	xField: 'hour',
            	yField: 'period',
            	tips: {
                    trackMouse: true,
                    width: 100,
                    height: 80,
                    renderer: function(storeItem, item) {
                        this.setTitle('time : ' + storeItem.get('hour'));
                        this.update('rate : ' + storeItem.get('rate') + '<br/>' + 'period : ' + storeItem.get('period') + '<br/>' + 'errors : ' + storeItem.get('numError'));
                    }
                },
                style: {
                    fill: '#9400D3',
                    stroke: '#9400D3',
                    'stroke-width': 1
                },
                markerConfig: {
                    type: 'circle',
                    size: 2,
                    radius: 2,
                    'stroke-width': 0,
                    fill: '#9400D3',
                    stroke: '#9400D3'
                }
            }]
        });
    
    var combostore = Ext.create('Ext.data.JsonStore', {
    	
    	fields : ['name','value'],
    	proxy : {
    		type : 'ajax',
    		url : 'combo'
    	}
    
    	
    });
   //combostore.load();
    
    var combp =  Ext.create('Ext.form.ComboBox', {
    	store : combostore,
    	displayField: 'name',
        valueField: 'value',
        listeners: {
        	'select' : function(){
        	     myMask.show();
        		 Ext.Ajax.request({
        		    	url : 'predict',
        		    	params : {
        		    		uname : combp.getValue() 
        		    	},
        		    	success : function(response){
        		    		var text =  response.responseText;
        		    	
        		    		window.datastore =  Ext.create('Ext.data.JsonStore',{
        		    	    	fields: ['hour', 'rate', 'period', 'numError' ],
        		    	    	data :Ext.JSON.decode(text)
        		    	    });
        		    		
        		    		chart1.store =  window.datastore;
        		    		chart1.redraw();
        		    	    myMask.hide();
        		    	}
        		    });
        	}
        	
        }
       
    });
    
    var turnof =  function(name) {
    	chart1.series.each(function(aSeries) {
    		if (aSeries.id == name) {
    			if (aSeries.hided == null || !aSeries.hided) {
    				aSeries.hideAll();
    				aSeries.hided = true;
    			} else {
    				aSeries.hided = false;
    				aSeries.showAll();
    			}
    			return;
    		}
    	});
    }
    
    var panel1 = Ext.create('widget.panel', {
        width: 1600,
        height: 800,
        title: 'Service Prediction',
        renderTo: Ext.getBody(),
        layout: 'border',
        tbar: [{
            text: 'Save Chart',
            handler: function(){ downloadChart(chart1); }
        },combp, {
        	text : 'rate',
        	handler : function(){ turnof('rateline')}
        }, {
        	text : 'period',
        	handler : function(){ turnof('periodline')}
        }],
        items:  chart1 
    });
   
    
    myMask.show();
    
    Ext.Ajax.request({
    	url : 'predict',
    	success : function(response){
    		var text =  response.responseText;
    		
    		window.datastore =  Ext.create('Ext.data.JsonStore',{
    	    	fields: ['hour', 'rate','period', 'numError'],
    	    	data : Ext.JSON.decode(text)
    	    });
    		
    		chart1.store =  window.datastore;
    		chart1.redraw();
    	    myMask.hide();
    	}
    });
  
});
