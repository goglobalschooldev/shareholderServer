const { gql } = require("apollo-server-express");

module.exports = gql`
    scalar DataTime
    type Shareholder {
        _id:ID
        first_Name: String
        last_Name: String
        gender: String
        position: String
        place_of_Birth: String
        date_of_Birth: DataTime
        national_Id: String
        image_src: String
        image_name: String
        documents: [Document]
        contact: Contact
        shares: [Share]
        properties: [Property]
        create_At: DataTime  
        update_At: DataTime 
        finger_Print: Fingerprint
        signatur: Signatur
        status: Boolean
    }
    type Fingerprint {
        src: String,
        name: String
    }
    type Signatur {
        src: String,
        name: String
    }
    type Contact {
        mail: String
        phone_Number: String
        location: String
    }
    type getShareholderMessage {
        message: String
        status: Boolean
        data: Shareholder 
    }
    type getShareholdersMessage {
        message: String
        status: Boolean
        data: [Shareholder] 
    }
    type getShareholdersPaginator {
        data:[Shareholder]
        paginator:Paginator
        message: String
    }
    type shareholderMessage {
        message: String
        status: Boolean
    }
    type certificateMessage {
        message: String
        status: Boolean
        data: Certificate
    }
    type Certificate {
        shaerholder_Name: String
        share_Value: Float
        
    }
# Input 
    input contactInput {
        mail: String
        password: String
        phone_Number: String
        location: String
    }
    input shareholderInput{
        first_Name: String!
        last_Name: String!
        gender: String!
        date_of_Birth: String!
        place_of_Birth: String
        national_Id: String
        image_src: String
        image_name: String
        contact: contactInput
        finger_Print: FingerprintInput
        signatur: SignaturInput
    }
    input shareholderInputUpdate{
        _id: String
        first_Name: String
        last_Name: String
        gender: String
        place_of_Birth: String
        national_Id: String
        image_src: String
        image_name: String
        contact: contactInput
        finger_Print: FingerprintInput
        signatur: SignaturInput
        date_of_Birth: String
    }
    input addDocShareholderInput{
          shareholder_Id: String         
          name: String
          display_Name: String
          src: String
    }
    input FingerprintInput {
        src: String,
        name: String
    }
    input SignaturInput {
        src: String,
        name: String
    }
    input shareholderInputByAdimin {
        admin_Id: String!
        first_Name: String!
        last_Name: String!
        gender: String!
        date_of_Birth: String!
        place_of_Birth: String!
        national_Id: String!
        image_src: String!
        image_name: String!
        contact: contactInput!
    }
    type Query {
         getSherholder(shareholder_Id: String!): getShareholderMessage!
         getShareholderbyProperty(property_Id: String!): getShareholdersMessage!
         getShareHolderCertificat(shareholder_Id: String!, property_Id: String!): certificateMessage!
         getShareholderWithPagination(page: Int!,limit: Int!, keyword: String!, property_Id: String!): getShareholdersPaginator!
    }
    type Mutation {
        createShareholder(input: shareholderInput!): getShareholderMessage!
        createShareholderByAdmin(input: shareholderInputByAdimin!): shareholderMessage!
        changeMail(mail: String! password: String!, _id: String!): shareholderMessage!
        updateShareholder(input: shareholderInputUpdate!): getShareholderMessage!
        deleteShareholder(shareholderId: String!, propertyId: String!): shareholderMessage!
        addDocShareholder(input: addDocShareholderInput!): shareholderMessage!
        removeDocShareholder(shareholder_Id: String!, doc_Id: String!): shareholderMessage!
        renameDocShareholder(shareholder_Id: String!, doc_Name: String!, doc_Id: String): shareholderMessage!
        addShareholderProperty(shareholder_Id: String!, property_Id: String!): shareholderMessage!
        addFingerPrintShareholder(shareholder_Id: String!,name: String!, src: String!): shareholderMessage!
        addSignaturShareholder(shareholder_Id: String!,name: String!, src: String!): shareholderMessage!
        removeShareHolderProperty(shareholder_Id: String!, property_Id: String!): shareholderMessage!
    }
`