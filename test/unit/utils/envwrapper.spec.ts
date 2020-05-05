import { describe } from "mocha";
import { Wrapper } from "../../../src/utils/Environment";
import { expect } from "chai";

describe("#Environment wrapper test", () => {
    it("~should be able to get a value/null given a key", () => {
        expect(Wrapper.get('randomkey')).to.equal(null);
    });

    it("~should be able to set a value given a key", () => {
        Wrapper.set('randomkey', 'daniel');
        expect(Wrapper.get('randomkey')).to.equal('daniel');
    });

    it("~should be able to delete a value given a key", () => {
        Wrapper.delete('randomkey');
        expect(Wrapper.get('randomkey')).to.equal(null);
    });
});