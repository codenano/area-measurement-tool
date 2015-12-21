import Ember from 'ember';

export default Ember.Component.extend({

    tagName: '',

    actions: {
        deleteRecord()
        {
            // Get the id
            let id = this.perimeter.id;

            // Pass the id up to the delete function of the mapper toolbox
            this.get('deletePerimeter')(id);
        },

        editUnit(unit)
        {
            // Get the id
            let id = this.perimeter.id;

            // Create a data object containing the 's id and unit
            let data = {
                id: id,
                unit: unit
            };

            // Pass the data up to the edit unit function of the mapper toolbox
            this.get('editPerimeterUnit')(data);
        },

        highLight()
        {
            let id = this.perimeter.id;

            this.get('highLightPerimeter')(id);
        },

        unLight()
        {
            let id = this.perimeter.id;

            this.get('unLightPerimeter')(id);
        }
    }
});
