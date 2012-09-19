  /**
   *  Edit Geometry dialog, comes from Small Dialog -> cell editor!
   * 
   *  Associate templates:
   *    - dialog_small_edit
   *    - geometry_editor
   */
  
  
  cdb.admin.EditGeometryDialog = cdb.admin.SmallDialog.extend({

    className: "floating edit_text_dialog geometry_dialog",

    events: cdb.core.View.extendEvents({
      'keyup input':    '_keyInput',
      'keyup textarea': '_keyTextarea'
    }),

    initialize: function() {
      var self = this;
      _.extend(this.options, {
        template_name: 'common/views/dialog_small_edit',
        title: '',
        description: '',
        clean_on_hide: true
      });

      // Activated by default
      this.enable = true;

      // Create a fake model
      this.model = new Backbone.Model();
      
      cdb.ui.common.Dialog.prototype.initialize.apply(this);

      // Render
      this.render();

      // Append to the document
      $(document.body).find("div.table table").append(this.el);
    },

    render_content: function() {
      // render loading if the GeoJSON is not loaded
      var geojson = this.options.row.get('the_geom')
        , template = cdb.templates.getTemplate("table/cell_editors/views/geometry_editor")
        , $content = this.$content = $("<div>").append(template);

      if (this.options.row.isGeomLoaded()) {
        this.geojson = geojson;
        this._chooseGeom();
      } else {
        this._loadGeom();
      }

      return $content;
    },


    /**
     *  Load geom if it is not loaded
     */
    _loadGeom: function() {
      var self = this;
      this.options.row.bind('change', function() {
        self.geojson = self.options.row.get("the_geom");
        self._chooseGeom();
      }, this);
      this.options.row.fetch();
    },


    /**
     *  Choose scenario for the editor
     */
    _chooseGeom: function() {
      var geom = JSON.parse(this.geojson);
      if (geom && geom.type.toLowerCase()=="point") {
        // Remove other options
        this.$content.find("div.loader").remove();
        this.$content.find("div.rest").remove();
        // Fill inputs
        this.$content.find("div.point").show();
        this.$content.find("input.longitude").val(geom.coordinates[0]);
        this.$content.find("input.latitude").val(geom.coordinates[1]);
      } else {
        // Remove other options
        this.$content.find("div.loader").remove();
        this.$content.find("div.point").remove();
        // Fill textarea
        this.$content.find("div.rest").show();
        this.$content.find("textarea").val(this.geojson);
      }
    },


    /**
     *  Check if the number is well formed or not
     */
    _checkNumber: function(number) {
      var pattern = /^-?(?:[0-9]+|[0-9]*\.[0-9]+)$/;
      if (pattern.test(number)) {
        return true
      } else {
        return false
      }
    },


    /**
     *  Check latitude and longitude inputs
     */
    _checkInputs: function() {
      var enable = true
        , $latitude = this.$el.find("input.latitude")
        , $longitude = this.$el.find("input.longitude");

      if (this._checkNumber($latitude.val())) {
        $latitude.removeClass("error");
      } else {
        $latitude.addClass("error");
        enable = false;
      }

      if (this._checkNumber($longitude.val())) {
        $longitude.removeClass("error");
      } else {
        $longitude.addClass("error");
        enable = false;
      }

      return enable;
    },


    /**
     *  When user type any number we check it if it is correct
     */
    _keyInput: function(ev) {

      if (this._checkInputs()) {
        this.enable = true;

        // Save model
        var lat = this.$el.find("input.latitude").val()
          , lon = this.$el.find("input.longitude").val();
        this.model.set("geojson", JSON.stringify({"type": "Point", "coordinates": [lon,lat]}));

        if(ev.keyCode === 13) {
          ev.preventDefault();
          this._ok();
        }
      } else {
        this.enable = false;

        if(ev.keyCode === 13) {
          ev.preventDefault();
        }
      }
    },


    /**
     *  Key press binding for textarea
     */
    _keyTextarea: function(ev) {

      if (ev.keyCode === 13) {
        this._ok();
        ev.preventDefault();
        return false;
      }

      // Save model
      var geojson = $(ev.target).val() 
      this.model.set("geojson", geojson);
    },


    /**
     *  Show dialog at position x,y
     */
    showAt: function(x, y, width, fix) {
      this.$el.css({
        top: y,
        left: x,
        minWidth: width
      });

      if (fix) {
        this.$el.find("textarea").css({
          minWidth: width - 22
        })
      }

      this.show();
      this.$el.find("textarea, input.longitude")
        .focus()
        .select();
    },


    /**
     *  Ok button function
     */
    _ok: function(ev) {
      if(ev) ev.preventDefault();

      // If the time is not ok, the dialog is not correct
      if (!this.enable) {
        return false;
      }

      if (this.ok) {
        this.ok();
      }

      this.hide();
    },


    /**
     *  Ok function
     */
    ok: function() {
      if (this.options.res) {
        this.options.res(this.model.toJSON().geojson);
      }
    }
  });