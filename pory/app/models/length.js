import DS from 'ember-data';
import Ember from 'ember';

export default DS.Model.extend({
    x1: DS.attr('number'),
    y1: DS.attr('number'),
    x2: DS.attr('number'),
    y2: DS.attr('number'),

    px: DS.attr('number'),
    mm: DS.attr('number'),
    unit: DS.attr('string'),

    rev: DS.attr('string'),

    unitLength: Ember.computed('mm', 'unit', function()
    {
        // Get the unit
        let unit = this.get('unit');

        // Get the length in mm
        let mm = this.get('mm');

        // Create the variable to hold the unit length
        let unitLength = null;

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
            if (unit === measurement.unit){
                unitLength = mm * measurement.value;
            }
        });

        return unitLength;

    })
});
