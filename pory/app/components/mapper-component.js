import Ember from 'ember';

import Display from 'porycore/classes/display';

export default Ember.Component.extend({
    display: null,

    mouseX: Ember.computed.alias('display.mouseX'),
    mouseY: Ember.computed.alias('display.mouseY'),
    initialMeasurementPoint1Coords: Ember.computed.alias('display.initialFirstPoint'),
    initialMeasurementPoint2Coords: Ember.computed.alias('display.initialSecondPoint'),
    initialMeasurementLength: Ember.computed.alias('display.initialMeasurementLength'),
    displayWarning: Ember.computed.alias('display.displayWarning'),

    previousSegment: null,
    invalidSegment: false,

    initialMeasurementPoint1Taken: false,
    initialMeasurementPointsTaken: false,

    actualInitialMeasurement: null,
    initialMeasurementUnit: 'mm',

    measurementSelection: 'length',

    mm: null,
    s_mm: null,

    lastLengthUnit: 'mm',
    lastAreaUnit: 's_mm',

    toolboxWarning: '',

    /*---------- Proprieties to observe ----------------------*/
    // Any warning sent by the display service if forwarded to the toolboxWaring
    displayWarningChange: Ember.observer('displayWarning', function() {
        this.set('toolboxWarning', this.get('displayWarning'));
    }),

    initialMeasurementPoint1Change: Ember.observer('initialMeasurementPoint1Coords', function() {
      let point = this.get('initialMeasurementPoint1Coords');
      if (point) {
          this.set('initialMeasurementPoint1Taken', true);
      }
    }),

    initialMeasurementPoint2Change:  Ember.observer('initialMeasurementPoint2Coords', function() {
        let point = this.get('initialMeasurementPoint2Coords');
        if (point) {
            this.set('initialMeasurementPointsTaken', true);
        }
    }),

    // When user changes the typeof measurements he wants to do, this method
    // is called. It sets the display event callbacks to the appropriate ones.
    measurementSelectionChange: Ember.observer('measurementSelection', function() {
        if (this.get('measurementSelection') === 'length') {
          this.get('display').setDisplayForLengthMeasurements((pt1, pt2) => this.recordLength(pt1, pt2));
        } else if (this.get('measurementSelection') === 'area') {
          this.get('display').setDisplayForMeasurements(polyline => this.recordArea(polyline));
        } else {
          this.get('display').setDisplayForMeasurements(periline => this.recordPerimeter(periline));
        }
    }),
    /*------------------------------------------------------------------------*/

    didInsertElement()
    {
        this.initialize();
    },

    actions: {
        startOver()
        {
            this.set('initialMeasurementPoint1Taken', false);
            this.set('initialMeasurementPointsTaken', false);
            this.set('initialMeasurementUnit', 'mm');
            this.set('measurementSelection', 'length');
            this.get('display').deleteAllDisplayedMeasurements();
            this.get('display').startOver();
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

            let measurementUnit = [
                {'unit':'mm', 'value':1},
                {'unit':'cm', 'value':10},
                {'unit':'in', 'value':25.4},
                {'unit':'ft', 'value':304.8},
                {'unit':'yd', 'value':914.4},
                {'unit':'m',  'value':1000},
            ];

            // Get the amount of millimetres in the measurement
            measurementUnit.forEach(function(measurement){
                if (initialMeasurementUnit === measurement.unit){
                    actualInitialMeasurementInMm = actualInitialMeasurement * measurement.value;
                }
            });

            // Divide the measurement by the amount of millimetres we have
            let mm = initialMeasurementLength / actualInitialMeasurementInMm;

            // Set the length of 1mm
            this.set('mm', mm);

            // Set the area of 1 s_mm (square millimetres)
            this.set('s_mm', mm * mm);

            // Remove any errors
            this.set("toolboxWarning", "");

            this.get('display').deleteAllDisplayedMeasurements();

            // Set the last unit
            this.set('lastLengthUnit', initialMeasurementUnit);

            // The resolution calculation is done, we can now make measurements
            // This call will setup the display callbacks which depend on the current
            // measurement type setting (length or area)
            this.measurementSelectionChange();

        },

        deleteLength(id)
        {
            // Pass the id up to the controller
            this.get('deleteDataLength')(id);

            this.get('display').deleteLength(id);

        },

        editLengthUnit(data)
        {
            // Pass the data up to the controller
            this.get('editDataLengthUnit')(data);

            // Set the last unit
            this.set('lastLengthUnit', data.unit);
        },

        deleteArea(id)
        {
          // Pass the id up to the controller
          this.get('deleteDataArea')(id);

          this.get('display').deleteArea(id);
        },

        editAreaUnit(data)
        {
          // Pass the data up to the controller
          this.get('editDataAreaUnit')(data);

          // Set the last unit
          this.set('lastAreaUnit', data.unit);
        },

        highLightArea(id)
        {
            this.get('display').highLightArea(id);
        },

        highLightLength(id)
        {
            this.get('display').highLightLength(id);
        },

        unLightArea(id)
        {
          this.get('display').unLightArea(id);
        },

        unLightLength(id)
        {
            this.get('display').unLightLength(id);
        },

        unLightPerimeter(id)
        {
            this.get('display').unLightArea(id);
        },

        highLightPerimeter(id)
        {
            this.get('display').highLightArea(id);
        },

        deletePerimeter(id)
        {
          // Pass the id up to the controller
          this.get('deleteDataPerimeter')(id);

          this.get('display').deleteArea(id);
        },

        editPerimeterUnit(data)
        {
          // Pass the data up to the controller
          this.get('editDataPerimeterUnit')(data);

          // Set the last unit
          this.set('lastPerimeterUnit', data.unit);
        },

    },

    initialize()
    {
        this.deleteAllData();

        this.set('display', Display.create());
        //this.get('display').initDisplay();
        this.get('display').setDisplayForResolutionMeasurement();
    },

    // Polyline  defines a none intersecting contour of a polygon.
    // The polyline is a list of vertices, each one  defined as (x:x,y:y}
    // The last edge of the polygon is implicit between the first and last vertex
    // of the polyline
    // NOTE: this method does not check if polyline is a none intersecting contour
    //       it assumes that it is.
    calculatePolygonArea: function(polyline) {

        // We need a minimum of 3 vertex to define a polygone
        if (polyline.length < 3) {
            return 0;
        }

        let area = polyline.reduce(function(acc, value, index, array) {
            if  (index === 0) {
                let length = array.length;
                acc =  acc + array[length -1].x * value.y - array[length -1].y * value.x;
            } else {
               acc = acc + array[index -1].x * value.y - array[index -1].y * value.x;
            }
            return acc;
        }, 0);

        area = area / 2.0;
      
        // Polygone could be clock-wise or anti clock-wise
        return Math.abs(area);
    },

    calculatePerimeterArea: function(periline) {

        // Get the length of 1mm
        let mm = this.get('mm');
 
        for (var i = 0, perimeter = 0; i < periline.length; i++) {
            
            if (typeof periline[i+1] === 'undefined') {
                perimeter += Math.sqrt(
                    Math.pow(periline[i].x - periline[0].x, 2) + 
                    Math.pow(periline[i].y - periline[0].y, 2) ) / mm;
            } else {
                perimeter += Math.sqrt(
                    Math.pow(periline[i].x - periline[i+1].x, 2) + 
                    Math.pow(periline[i].y - periline[i+1].y, 2) ) / mm;    
            }
        }

        return perimeter;
    },

    recordArea(polyline)
    {
        // Calculate the surface
        let measurementArea = this.calculatePolygonArea(polyline);

        // Get the area of 1 square mm
        let s_mm = this.get('s_mm');

        // Get the last unit
        let lastAreaUnit = this.get('lastAreaUnit');

        // Create a data object containing the area's data
        let data = {
            poly:  polyline,
            px: measurementArea,
            s_mm: measurementArea / s_mm,
            unit: lastAreaUnit
        };

        return this.get('createDataArea')(data);
    },

    recordPerimeter(periline)
    {
        // Calculate the surface
        let measurementPerimeter = this.calculatePerimeterArea(periline);

        // Get the last unit
        let lastAreaUnit = this.get('lastAreaUnit');

        // Create a data object containing the area's data
        let data = {
            poly:  periline,
            px: measurementPerimeter,
            s_mm: measurementPerimeter,
            unit: lastAreaUnit
        };

        return this.get('createDataPerimeter')(data);
    },

    recordLength(pt1, pt2)
    {
        // Calculate the measurement length
        let measurementLength = Math.sqrt(
            Math.pow(pt1.x - pt2.x, 2) + Math.pow(pt1.y - pt2.y, 2)
        );

        // Get the length of 1mm
        let mm = this.get('mm');

        // Get the last unit
        let lastLengthUnit = this.get('lastLengthUnit');

        // Create a data object containing the length's data
        let data = {
            x1: pt1.x,
            y1: pt1.y,
            x2: pt2.x,
            y2: pt2.y,
            px: measurementLength,
            mm: measurementLength / mm,
            unit: lastLengthUnit
        };

        return this.get('createDataLength')(data);
    },

    deleteDataLengths()
    {
        // Pass it up to the controller
        this.get('deleteDataLengths')();
    },

    deleteDataAreas()
    {
      // Pass it up to the controller
      this.get('deleteDataAreas')();
    },


    deleteDataPerimeters()
    {
      // Pass it up to the controller
      this.get('deleteDataPerimeters')();
    },

    deleteAllData()
    {
        this.deleteDataLengths();
        this.deleteDataAreas();
        this.deleteDataPerimeters();
    }
});
