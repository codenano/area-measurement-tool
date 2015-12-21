import DS from 'ember-data';
import Ember from 'ember';

export default DS.Model.extend({
    poly: DS.attr(),

    px: DS.attr('number'),

    // square millimetres
    s_mm: DS.attr('number'),
    unit: DS.attr('string'),

    rev: DS.attr('string'),

    unitPerimeter: Ember.computed('mm', 'unit', function()
    {
        // Get the unit
        let unit = this.get('unit');

        // Get the area in mm
        let mm = this.get('mm');

        // Create the variable to hold the unit area
        let unitPerimeter = null;

        let measurementUnit = [
            {'unit':'mm', 'value':1},         // Get the amount of square millimetres in the measurement
            {'unit':'cm', 'value':100.0},     // Get the amount of square centimetres in the measurement
            {'unit':'in', 'value':645.16},    // Get the amount of square inches in the measurement
            {'unit':'ft', 'value':92903.04},  // Get the amount of square feet in the measurement
            {'unit':'yd', 'value':836127.36}, // Get the amount of square yards in the measurement
            {'unit':'m',  'value':1000000.0}, // Get the amount of square metres in the measurement
        ];

        measurementUnit.forEach(function(measurement){
            if (unit === measurement.unit){
                unitPerimeter = mm / measurement.value;
            }
        });    

        return unitPerimeter;
    })
});
