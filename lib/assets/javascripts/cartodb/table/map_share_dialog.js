/**
 * shows a dialog to share a map view
 * new ExportTableDialog({
 *  table: table_model
 * })
 * 
 */
cdb.admin.ShareMapDialog = cdb.admin.BaseDialog.extend({

  events: cdb.core.View.extendEvents({
  }),

  initialize: function() {
    var self = this;
    _.extend(this.options, {
      title: _t("Share your map"),
      description: '',
      template_name: 'common/views/dialog_base',
      clean_on_hide: true,
      ok_button_classes: "button grey",
      ok_title: "close",
      modal_type: "",
      width: 600,
      modal_class: 'map_share_dialog'
    });

    this.constructor.__super__.initialize.apply(this);

    this.mapOptions = new Backbone.Model({
      title: true,
      description: true,
      search: false,
      sql: this.options.table.data().getSQL()
    });

    this.mapOptions.bind('change', this._setUrl, this);
    this.mapOptions.bind('change', this._changePreview, this);
    this.options.map.bind('change', function() {
      var bounds = self.mapView.getBounds();
      var c = self.options.map.get('center');
      self.mapOptions.set({
        sw_lat: bounds[0][0],
        sw_lon: bounds[0][1],
        ne_lat: bounds[1][0],
        ne_lon: bounds[1][1]
        /*
        lat: c[0],
        lon: c[1],
        zoom: self.options.map.getZoom()
        */
      });
    }, this);
    this.add_related_model(this.options.map);
  },

  // change the map preview showing how it will look
  _changePreview: function() {
    var title = this.mapOptions.get('title');
    var description = this.mapOptions.get('description');
    this.$('.header_title')[title ? 'show':'hide']();
    this.$('.header_description')[description ? 'show':'hide']();

    if(!title && !description) {
      this.$('.map_header').hide();
    } else {
      this.$('.map_header').show();
    }
  },

  _setUrl: function() {
    var tableName = this.options.table.get('name');
    var opts = _.map(this.mapOptions.attributes, function(v, k) {
      return k + "=" + encodeURIComponent(v);
    });
    opts = opts.join('&');

    this.$('.url').html(
      "&lt;iframe src='" +
      location.origin + "/tables/" + tableName + "/embed_map?" + opts +
      "'&gt;&lt;/iframe&gt;"

    );
  },

  render_content: function() {
    var self = this;

    this.$('.content').append(
      this.getTemplate('table/views/share_map_dialog')({
        title: this.options.table.get('name'),
        description: this.options.table.get('description')
      })
    );

    // map
    // HACK: wait to open
    setTimeout(function() {
      self.mapView = new cdb.geo.LeafletMapView({
          el: self.$('.map'),
          map: self.options.map
      });
      self.addView(self.mapView);
    }, 1000);

    // zoom
    var zoomControl = new cdb.geo.ui.Zoom({
      model:    this.options.map,
      template: this.getTemplate("table/views/zoom_control")
    });
    self.addView(zoomControl);
    this.$('.map_wrapper').append(zoomControl.render().$el);

    // switchs
    _(['title', 'description', 'search']).each(function(prop) {
      var className = '.' + prop;
      var sw = new cdb.forms.Switch({
        model: self.mapOptions,
        property: prop
      });
      self.addView(sw);
      self.$(className).append(sw.render().el);
    });

    this._setUrl();
    return '';
  }

});