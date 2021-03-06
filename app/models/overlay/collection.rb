# encoding: utf-8
require 'set'
require 'virtus'
require 'aequitas'
require_relative './member'
require_relative '../visualization'
require_relative '../../../services/data-repository/structures/collection'

module CartoDB
  module Overlay
    SIGNATURE = 'overlays'
    
    class Collection
      include Virtus
      include Aequitas

      attribute :visualization_id,  String
      validates_presence_of         :visualization_id

      def initialize
        @collection = 
          DataRepository::Collection.new({ signature: SIGNATURE }, defaults)
      end #initialize

      DataRepository::Collection::INTERFACE.each do |method_name|
        define_method(method_name) do |*arguments, &block|
          result = collection.send(method_name, *arguments, &block)
          return self if result.is_a?(DataRepository::Collection)
          result
        end
      end

      private

      attr_reader :collection

      def defaults
        { 
          repository:   Visualization.repository,
          member_class: Member
        }
      end #defautls
    end # Collection
  end # Overlay
end # CartoDB

