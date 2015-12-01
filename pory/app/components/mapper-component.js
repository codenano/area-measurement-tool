import Ember from 'ember';

export default Ember.Component.extend({
    canvas: null,

    mouseX: 0,
    mouseY: 0,

    initialMeasurementPoint1Coords: null,
    initialMeasurementPoint1Taken: false,

    initialMeasurementPoint2Coords: null,
    initialMeasurementPointsTaken: false,

    initialMeasurementLength: null,
    actualInitialMeasurement: null,
    initialMeasurementUnit: 'mm',

    measurementPoint1Coords: null,
    measurementPoint1Taken: false,

    measurementPoint2Coords: null,
    measurementPointsTaken: false,

    measurementLengthCheck: true,
    measurementPolygonCheck: false,
   
    finalMeasurementCoords: {x:'', y:''},
    initialMeasurementCoords: {x:'', y:''},
    totalArrayCoordenates: [],
    lineColor: '',
    measurementNumber: 0,

    mm: null,

    lastUnit: 'mm',

    didInsertElement()
    {
        let canvas = this.get('canvas');

        // If it's not been initialized already initialize the canvas
        if (! canvas) {

            this.initializeCanvas();
        }
    },
   
    actions: {

        measurementLengthCheckSelection()
        {
        
            Ember.$('#measuramentCheck').prop('checked', false);
            this.set('measurementLengthCheck',true);
            this.set('measurementPolygonCheck',false);
        },

        measurementPolygonCheckSelection()
        {
        
            Ember.$('#lengthCheck').prop('checked', false);
            this.set('measurementPolygonCheck',true);
            this.set('measurementLengthCheck',false);
        },

        startOver()
        {
            // Reset the properties
            this.set('initialMeasurementPoint1Coords', null);
            this.set('initialMeasurementPoint2Coords', null);
            this.set('initialMeasurementPoint1Taken', false);
            this.set('initialMeasurementPointsTaken', false);
            this.set('initialMeasurementLength', null);
            this.set('initialMeasurementUnit', 'mm');
            this.set('mouseX', 0);
            this.set('mouseY', 0);

            // Get the canvas
            let canvas = this.get('canvas');

            // Make sure it's been initialized
            if (! canvas) {
                return;
            }

            // Iterate through all the canvas' objects
            canvas.forEachObject(function(obj)
            {
                // If it's not an image remove it
                if (obj.type !== 'image') {
                    canvas.remove(obj).renderAll();
                }
            });
        },

        setRatio()
        {
            // Get the initial measurement length
            let initialMeasurementLength = this.get('initialMeasurementLength');

            // Get the actual initial measurement
            let actualInitialMeasurement = this.get('actualInitialMeasurement');

            // Make sure they've entered an actual measurement
            if (! actualInitialMeasurement) {

                // Tell them to enter the measurement length
                this.set("toolboxWarning", "Enter the length to continue.");

                return;
            }

            // Get the initial measurement unit
            let initialMeasurementUnit = this.get('initialMeasurementUnit');

            // Get the length of 1mm
            let actualInitialMeasurementInMm = null;

            switch (initialMeasurementUnit) {
                case 'mm':

                    // Get the amount of millimetres in the measurement
                    actualInitialMeasurementInMm = actualInitialMeasurement;

                    break;

                case 'cm':

                    // Get the amount of millimetres in the measurement
                    actualInitialMeasurementInMm = actualInitialMeasurement * 10;

                    break;

                case 'in':

                    // Get the amount of millimetres in the measurement
                    actualInitialMeasurementInMm = actualInitialMeasurement * 25.4;

                    break;

                case 'ft':

                    // Get the amount of millimetres in the measurement
                    actualInitialMeasurementInMm = actualInitialMeasurement * 304.8;

                    break;

                case 'yd':

                    // Get the amount of millimetres in the measurement
                    actualInitialMeasurementInMm = actualInitialMeasurement * 914.4;

                    break;

                case 'm':

                    // Get the amount of millimetres in the measurement
                    actualInitialMeasurementInMm = actualInitialMeasurement * 1000;

                    break;
            }

            // Divide the measurement by the amount of millimetres we have
            let mm = initialMeasurementLength / actualInitialMeasurementInMm;

            // Set the length of 1mm
            this.set('mm', mm);
         
            // Remove any errors
            this.set("toolboxWarning", "");

            // Get the canvas
            let canvas = this.get('canvas');

            // Iterate through all the canvas' objects
            canvas.forEachObject(function(obj)
            {
                // If it's not an image remove it
                if (obj.type !== 'image') {
                    canvas.remove(obj).renderAll();
                }
            });

            // Set the last unit
            this.set('lastUnit', initialMeasurementUnit);

        },

        deleteLength(id)
        {
            // Pass the id up to the controller
            this.get('deleteLength')(id);

            // Get the canvas
            let canvas = this.get('canvas');
           
            let  searchReference = '';

            // Remove the measurement from the canvas
            canvas.forEachObject(function(obj)
            {
            
               if (obj.id === `${id}_point_2`) {
                    
                    // Unique reference value in every measurament 
                    searchReference = obj.reference;
                }
            });

            canvas.forEachObject(function(obj)
            {
               // Delete measurement on canvas 
               if (obj.reference === searchReference) {
                  
                    canvas.remove(obj).renderAll();
                }
            });

            // Remove the length from the canvas
            canvas.remove(this.getCanvasObject(`${id}_point_1`) ).renderAll();
            canvas.remove(this.getCanvasObject(`${id}_point_2`)).renderAll();
            canvas.remove(this.getCanvasObject(`${id}_join_line`)).renderAll();
        },

        editLengthUnit(data)
        {
            // Pass the data up to the controller
            this.get('editLengthUnit')(data);

            // Set the last unit
            this.set('lastUnit', data.unit);
        }
    },

    initializeCanvas()
    {
        let self = this;

        // Initiate the canvas
        let canvas = new fabric.Canvas('mapperCanvas');

        // Get the offset of the canvas
        let canvasOffset = Ember.$('#mapperCanvas').offset().top;

        // Get the height on the window's inner height
        let innerHeight = window.innerHeight;

        // Calculate the height of the canvas
        let canvasHeight = innerHeight - canvasOffset;

        // Set the height of the canvas
        canvas.setHeight(canvasHeight);

        // Set the height of the toolbox
        Ember.$('.col-toolbox').height(canvasHeight);

        // Get the width of the canvas' column
        let canvasColumnWidth = Ember.$('.col-canvas').width();

        // Set the width of the canvas
        canvas.setWidth(canvasColumnWidth);

        // Disable group selection
        canvas.selection = false;

        // Load the test image
        fabric.Image.fromURL('images/floorplan.jpg', function(img)
        {
            // Scale the image to the height of the canvas
            img.scaleToHeight(canvas.height);

            // Make it so the user can't interact with or select the image
            img.evented = img.selectable = false;

            // Set the X origin to the center of the image so we can center it
            img.originX = 'center';

            // Center the image
            img.left = canvas.width / 2;

            // Add the image to the canvas and rerender it
            canvas.add(img).renderAll();
        });

        // Bind an event to track the position of the cursor on the canvas
        canvas.on('mouse:move', function(options)
        {
            // Get the pointer
            let pointer = canvas.getPointer(options.e);

            // Set the X position of the mouse
            self.set('mouseX', pointer.x);

            // Set the Y position of the mouse
            self.set('mouseY', pointer.y);
        });

        // Bind an event to track when a user clicks on the canvas
        canvas.on('mouse:up', function(options)
        {
            // Get the length of 1mm
            let mm = self.get('mm');
           
            if (self.get('measurementLengthCheck') === true) {
                
                // Calculate Length of Two Points 
                self.setLengthMeasurement(mm,options);
            }
       
            else if (self.get('measurementPolygonCheck') === true) {
                
                // Calculate Measurement Area
                self.setPolygonMeasurementArea();
            }
           
        });

        // Set the default cursor to a crosshair
        canvas.defaultCursor = 'crosshair';

        // Set the canvas
        this.set('canvas', canvas);

        // Delete any existing lengths
        this.deleteLengths();
    },

    setLengthMeasurement(mm, options)
    {
        let self = this; 

        // The length of 1mm is set
        if (mm) {
            
            let firstPoint = (self.get('measurementPoint1Taken') === false);
            let secondPoint = (self.get('measurementPointsTaken') === false);
           
            // This is our first initial point
            if (firstPoint) {

                // Set the first initial measurement point
                self.setMeasurementPoint1(options);
            }

            // This is our second initial point
            else if (secondPoint) {

                // Set the second initial measurement point
                self.setMeasurementPoint2(options);
            }
        }

        // The length of 1mm isn't set yet
        else {

            let firstPoint = (self.get('initialMeasurementPoint1Taken') === false);
            let secondPoint = (self.get('initialMeasurementPointsTaken') === false);

            // This is our first initial point
            if (firstPoint) {

                // Set the first initial measurement point
                self.setInitialMeasurementPoint1(options);
            }

            // This is our second initial point
            else if (secondPoint) {

                // Set the second initial measurement point
                self.setInitialMeasurementPoint2(options);
            }
        }
    },

    setPolygonMeasurementArea()
    {
        let self = this;

        //let polygon = 0; 
        let polygonX = 0; 
        let polygonY = 0; 

        let circle = '';

        // Get the length of 1mm
        let mm = self.get('mm');

        // Get the last unit
        let lastUnit = self.get('lastUnit');

        // Get the canvas
        let canvas = self.get('canvas');

        // Get Canvas Area
        let canvasArea = canvas.height * canvas.width;
          
        // Get the initial measurement length
        let initialMeasurementLength = self.get('initialMeasurementLength');

        // Get the actual initial measurement
        let actualInitialMeasurement = self.get('actualInitialMeasurement');
       
        // Get Measurement Area 
        let measurementArea = (((canvas.height * actualInitialMeasurement) / initialMeasurementLength) * ((canvas.width *  actualInitialMeasurement)  / initialMeasurementLength) );
       
        // Create the point
        let pointCoords = { 
            x: self.get('mouseX'),
            y: self.get('mouseY')
        };

        // Create the circle
        circle = self.makeCircle (pointCoords, self.get('measurementNumber') );
        
        self.totalArrayCoordenates.push( pointCoords );

        if (!self.get('initialMeasurementCoords.x')){    
    
            // Set the firts Polygon coordenates 
            self.set('initialMeasurementCoords', pointCoords);
            
            // Set the final polygon coordenates 
            self.set('finalMeasurementCoords', self.get('initialMeasurementCoords'));
            
            // Set the line color
            self.set('lineColor', self.makeRandomColor());
     
            // Render the Circle 
            canvas.add(circle).renderAll(); 
                
            // Animate the Circle 
            self.animateCircle(circle,canvas);
        }
        else{
                 // Create a line to be drawn between the two points
                let line = self.drawLine(self.get('finalMeasurementCoords'), pointCoords, self.get('lineColor'), self.get('measurementNumber'));
               
                // Get the first point
                let firstPoint = self.getCanvasObject('first');

                // Get the index of the first point
                let firstPointIndex = canvas.getObjects().indexOf(firstPoint);

                 // Add the line to the canvas and rerender it
                canvas.add(line).renderAll();

                // Move the line to below the first point
                line.moveTo(firstPointIndex);

                // Rerender the canvas
                canvas.renderAll();

                // Set the final polygon coordenates 
                self.set('finalMeasurementCoords', pointCoords);
              
                // Verificate if the user last click was close to the first Polygon point
                if((self.get('finalMeasurementCoords.x') <= self.get('initialMeasurementCoords.x') + 10 ) && 
                  ( self.get('finalMeasurementCoords.x') >= self.get('initialMeasurementCoords.x') - 10 ) && 
                  ( self.get('finalMeasurementCoords.y') <= self.get('initialMeasurementCoords.y') + 10 ) && 
                  ( self.get('finalMeasurementCoords.y') >= self.get('initialMeasurementCoords.y') - 10 ) ){ 
                   
                    // Create the circle
                    circle = self.makeCircle (self.get('initialMeasurementCoords'), self.get('measurementNumber'));
                        
                    // Render the Circle 
                    canvas.add(circle).renderAll(); 
                        
                    // Animate the Circle 
                    self.animateCircle(circle,canvas);
                    
                    // Gauss Formula for Irregular Polygon Area Calculation
                    for (var i = 0; i < self.get('totalArrayCoordenates.length'); i++) {
              
                        if (( i + 1 ) === self.get('totalArrayCoordenates.length')) {
                         
                            polygonX = polygonX + ((self.totalArrayCoordenates.objectAt(i).x * self.totalArrayCoordenates.objectAt(0).y));
                            polygonY = polygonY + ((self.totalArrayCoordenates.objectAt(0).x * self.totalArrayCoordenates.objectAt(i).x));
                            break;
                        }
                    
                        polygonX = polygonX + ((self.totalArrayCoordenates.objectAt(i).x * self.totalArrayCoordenates.objectAt(i+1).y));
                        polygonY = polygonY + ((self.totalArrayCoordenates.objectAt(i+1).x * self.totalArrayCoordenates.objectAt(i).y));
                    }

                    // Gauss Formula for measurament calculation result
                    let polygonPx = Math.abs((polygonX - polygonY) / 2) ;
                    
                    // Create a data object containing the measurement data
                    let data = {
                        x1: self.get('initialMeasurementCoords.x'),
                        y1: self.get('initialMeasurementCoords.y'),
                        x2: self.get('finalMeasurementCoords.x'),
                        y2: self.get('finalMeasurementCoords.y'),
                        px: polygonPx,
                        mm: polygonPx / mm,
                        unit: lastUnit
                    };

                     // Create the measurament
                    self.get('createLength')(data).then(function(length)
                    {   
                        circle.id = `${length.id}_point_2`;
                        line.id = `${length.id}_join_line`;
                    });  

                    // Inicializate measurament area
                    self.set('initialMeasurementCoords', {x:'', y:''});  

                    // Work as an id for measurament area identification
                    self.set('measurementNumber', self.get('measurementNumber') + 1);
     
            }
            else{
                    
                // Render the Circle 
                canvas.add(circle).renderAll(); 
                    
                // Animate the Circle 
                self.animateCircle(circle,canvas);
            }  
        }   
    },

    setInitialMeasurementPoint1()
    {
        let self = this;

        // Get the canvas
        let canvas = self.get('canvas');

        // Create the point
        let pointCoords = { 
            x: self.get('mouseX'),
            y: self.get('mouseY')
        };
        
        // Create the circle
        let circle = self.makeCircle (pointCoords,'initialMeasurementPoint1');
        
        // Render the Circle 
        canvas.add(circle).renderAll(); 
        
        // Animate the Circle 
        self.animateCircle(circle,canvas);

        // Set the first initial measurements coordinates
        self.set('initialMeasurementPoint1Coords', pointCoords);

        // Tell the app we've not set our first initial point
        self.set('initialMeasurementPoint1Taken', true);
    },

    setInitialMeasurementPoint2()
    {
        let self = this;

        // Get the canvas
        let canvas = self.get('canvas');

        // Create the point
        let pointCoords = { 
            x: self.get('mouseX'),
            y: self.get('mouseY')
        };

        // Create the circle
        let circle = self.makeCircle (pointCoords,'initialMeasurementPoint2');
        
        // Render the Circle 
        canvas.add(circle).renderAll(); 
        
        // Animate the Circle 
        self.animateCircle(circle,canvas);

        // Set the second initial measurements coordinates
        self.set('initialMeasurementPoint2Coords', pointCoords);

        // Tell the app we've not set our first initial point
        self.set('initialMeasurementPointsTaken', true);

        // Create a line to be drawn between the two points
        let line = self.drawLine(self.get('initialMeasurementPoint1Coords'), self.get('initialMeasurementPoint2Coords'),'#5CB85C',''); 
  
        // Get the first point
        let firstPoint = self.getCanvasObject('initialMeasurementPoint1');

        // Get the index of the first point
        let firstPointIndex = canvas.getObjects().indexOf(firstPoint);

        // Add the line to the canvas and rerender it
        canvas.add(line).renderAll();

        // Move the line to below the first point
        line.moveTo(firstPointIndex);

        // Rerender the canvas
        canvas.renderAll();

        // Calculate the initial measurement length
        let initialMeasurementLength = Math.sqrt(
            Math.pow(line.x2 - line.x1, 2) + Math.pow(line.y1 - line.y2, 2)
        );
 
        // Set the initial measurement length
        self.set('initialMeasurementLength', initialMeasurementLength);
    },

    setMeasurementPoint1()
    {
        let self = this;

        // Get the canvas
        let canvas = self.get('canvas');

        // Create the point
        let pointCoords = { 
            x: self.get('mouseX'),
            y: self.get('mouseY')
        };

        // Create the circle
        let circle = self.makeCircle (pointCoords,'measurementPoint1');
        
        // Render the Circle 
        canvas.add(circle).renderAll(); 
        
        // Animate the Circle 
        self.animateCircle(circle,canvas);

        // Set the first measurements coordinates
        self.set('measurementPoint1Coords', pointCoords);

        // Tell the app we've not set our first point
        self.set('measurementPoint1Taken', true);
    },

    setMeasurementPoint2()
    {
        let self = this;

        // Get the canvas
        let canvas = self.get('canvas');

        // Create the point
        let pointCoords = { 
            x: self.get('mouseX'),
            y: self.get('mouseY')
        };
  
        // Create the circle
        let circle = self.makeCircle (pointCoords,'measurementPoint2');
        
        //Render the Circle 
        canvas.add(circle).renderAll(); 
        
        // Animate the Circle 
        self.animateCircle(circle,canvas);
      
        // Set the second measurements coordinates
        self.set('measurementPoint2Coords', pointCoords);

        // Tell the app we've not set our first point
        self.set('measurementPointsTaken', true);

        // Create a line to be drawn between the two points
        let line = self.drawLine(self.get('measurementPoint1Coords'), self.get('measurementPoint2Coords'), '#5CB85C',''); 

        // Get the first point
        let firstPoint = self.getCanvasObject('measurementPoint1');

        // Get the index of the first point
        let firstPointIndex = canvas.getObjects().indexOf(firstPoint);

        // Add the line to the canvas and rerender it
        canvas.add(line).renderAll();

        // Move the line to below the first point
        line.moveTo(firstPointIndex);
      
        // Rerender the canvas
        canvas.renderAll();

        // Calculate the measurement length
        let measurementLength = Math.sqrt(
            Math.pow(line.x2 - line.x1, 2) + Math.pow(line.y1 - line.y2, 2)
        );

       // Set the measurement length
        self.set('measurementLength', measurementLength);
       
        // Get the length of 1mm
        let mm = self.get('mm');

        // Get the last unit
        let lastUnit = self.get('lastUnit');
     
        console.log("measuramentLength "+measurementLength / mm +" lastUnit "+lastUnit);

        // Create a data object containing the length's data
        let data = {
            x1: self.get('measurementPoint1Coords.x'),
            y1: self.get('measurementPoint1Coords.y'),
            x2: self.get('measurementPoint2Coords.x'),
            y2: self.get('measurementPoint2Coords.y'),
            px: measurementLength,
            mm: measurementLength / mm,
            unit: lastUnit
        };

        // Create the length
        self.get('createLength')(data).then(function(length)
        {   
            // Set the reference of our points and like to that of our ID
            firstPoint.reference = `${length.id}_point_1`;
            circle.reference = `${length.id}_point_2`;
            line.reference = `${length.id}_join_line`;
        });

        // Reset the properties
        self.set('measurementPoint1Coords', null);
        self.set('measurementPoint2Coords', null);
        self.set('measurementPoint1Taken', false);
        self.set('measurementPointsTaken', false);
        self.set('measurementLength', null);
    },

    getCanvasObject(reference)
    {

        let object = null;

        // Get the canvas
        let canvas = this.get('canvas');

        // Make sure it's been initialized
        if (! canvas) {
            return object;
        }

        // Iterate through all the canvas' objects
        canvas.forEachObject(function(obj)
        {
            // We've found the object we were looking for
            if (obj.reference === reference) {
                object = obj;
            }
        });

        return object;
    },

    deleteLengths()
    {
        // Pass it up to the controller
        this.get('deleteLengths')();
    },

    makeCircle(pointCoords,reference)
    {
        return  new fabric.Circle({
            radius: 8,
            fill: 'white',
            left: pointCoords.x,
            top: pointCoords.y,
            originX: 'center',
            originY: 'center',
            stroke: '#0275d8',
            strokeWidth: 7,
            reference: reference,
            hasControls: false,
            selectable: false,
            id: reference,
            
        });
    },
 
    animateCircle(circle,canvas)
    {
        // Animate the circle
        circle.animate('radius', '+=5', {
            onChange: canvas.renderAll.bind(canvas),
            duration: 100,
            easing: fabric.util.ease.easeInCubic,
            
            onComplete: function()
            {
                circle.animate('radius', '-=5', {
                    onChange: canvas.renderAll.bind(canvas),
                    duration: 150,
                    easing: fabric.util.ease.easeOutCubic
                });
            }
        });
    },

    drawLine(lastCoords,initCoords,color,reference) 
    {
        return new fabric.Line([lastCoords.x, lastCoords.y, initCoords.x, initCoords.y], {
            fill: color,
            stroke: color,
            strokeWidth: 5,
            selectable: false,
            reference:reference,
            id:reference,
        });
    },

    makeRandomColor()
    {

        return '#' + Math.random().toString(16).substring(2, 8);
    },

});
