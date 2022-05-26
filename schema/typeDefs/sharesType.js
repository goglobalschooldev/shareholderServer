const { gql } = require('apollo-server-express');

module.exports = gql`
    scalar DataTime
    type Share{
        _id: ID
        create_At: DataTime  
        update_At: DataTime 
        type: String
        total: Int
        unitPrice: Float
        sale_Anountment: Int
        start_Sale_At: DataTime  
        end_Sale_At: DataTime  
        property: Property
        sold_Out_Share:[Sold_Out_Share]
        status: Boolean
        closing: Boolean
    }
    type Sold_Out_Share{
        _id: ID
        invoice_Id: String
        share_Value: Int
        price: Int
        start_Id: Int
        end_Id: Int
        shareholder: Shareholder
        property: Property
        create_At: DataTime 
        share: Share
    }
    type shareMessage {
        status: Boolean
        message: String
    }
    type getShareMessage {
        status: Boolean
        message: String
        data: Share
    }
    type getOwnerShareMessage {
        status: Boolean
        message: String
        value: Float
    }
    type getSharesMessage {
        status: Boolean
        message: String
        data: [Share]
    }
   
    type getSharesDataMessage {
        status: Boolean
        message: String
        data: DateProperty
    }
    type DateProperty {
        shareholder: Float
        capital: Float
        share: Float
    }
    type getSharesSoldMessage {
        status: Boolean
        message: String
        data: [Sold_Out_Share]
    }
    type getSharesPaginatorMessage {
        shares:[Share]
        paginator:Paginator
        message: String
    }
    #Input 
    input CreateSellingShareInput {
        property: String!
        type: String!
        total: Int!
        unitPrice: Float!
        sale_Anountment: Int!
        start_Sale_At: String!
        end_Sale_At: String!
    }
    input buyingShareInput {
        property_Id: String!
        shareholder_Id: String!
        share_Value: Int!      
    }
    type Query {
        getShareById(_id: String!): getShareMessage!
        getSharesProperty(property_Id: String!): getSharesMessage!
        getSharesPagination(page: Int!,limit: Int!,keyword: String!, property_Id: String!): getSharesPaginatorMessage!
        getSharesSoldByShareholder(property_Id: String!, shareholder_Id: String!): getSharesSoldMessage!
        getShareholderOwnership(property_Id: String!, shareholder_Id: String!): getOwnerShareMessage!
        getPropertyData(property_Id: String!): getSharesDataMessage!
    }
    type Mutation {
        createSellingShare(input: CreateSellingShareInput!): shareMessage!
        expirationDateSellingShare(property_Id: String!): shareMessage!
        closingSellingShare(property_Id: String!, share_id: String!, date: String!): shareMessage!
        shareVoiding(share_Id: String!): shareMessage!
        buyingShare(input: buyingShareInput!): shareMessage!
        SoldOutShareVoiding(share_Id: String!): shareMessage!
    }

`