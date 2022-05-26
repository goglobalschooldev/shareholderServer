const { gql } = require("apollo-server-express");

module.exports = gql`
     scalar DataTime
     type Property {
          _id: ID
          create_At: DataTime
          update_At: DataTime
          name: String
          description: String
          mail: String
          location: String
          telephone: String
          website: String
          logo: String
          logoSrc: String
          documents: [Document]
          shareholders:[Shareholder]
     }

     type Document {
          _id: ID
          name: String
          display_Name: String
          src: String
     }
     type propertyMessage {
         status:  Boolean
         message: String
     }
     type getPropertyMessage {
         status:  Boolean
         message: String
         data: Property
     }
     type getPropertiesMessage {
         status:  Boolean
         message: String
         data: [Property]
     }
     # Input Type
     input propertyInput{
          name: String
          description: String
          mail: String
          location: String
          telephone: String
          website: String
          logo: String
          logoSrc: String
     }
     input propertyInputUpdate{
          _id: String
          name: String
          description: String
          mail: String
          location: String
          telephone: String
          website: String
          logo: String
          logoSrc: String
     }
     input docInput{
          propertyId: String         
          name: String
          display_Name: String
          src: String
     }
     type Query {
          getProperties(keyword: String!): [Property!]
          getProperty(_id: String!): getPropertyMessage!
          getTopCapitalProperties: getPropertiesMessage!
     }
     type Mutation {
          createProperty(input: propertyInput!): getPropertyMessage!
          deleteProperty(propertyId: String!): propertyMessage!
          updateProperty(input: propertyInputUpdate): getPropertyMessage!
          addDocToProperty(input: docInput!): propertyMessage!
          renamePropertyDoce(propertyId: String!, docName: String!, docId: String!): propertyMessage!
          removeDocFromProperty(docId: String!, propertyId: String!): propertyMessage!
     }
`
