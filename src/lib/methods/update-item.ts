import { UpdateCommandInput } from "@aws-sdk/lib-dynamodb";
import { DynamoDB } from "../dynamodb";
import { Table } from "../table";
import * as queryUtil from "../utils/query";
import { Executable } from "./executable";
import { InsertItem } from "./insert-item";

export class UpdateItem extends InsertItem implements Executable {
	constructor(table: Table, dynamodb: DynamoDB) {
		super(table, dynamodb);
	}

	/**
	 * Create a conditional update item object where the condition should be satisfied in order for the item to be
	 * updated. This should be used if you want to update a record but not insert one if the index does not exist.
	 *
	 * @param	condition           A condition that must be satisfied in order for a conditional UpdateItem to succeed.
	 */
	where(condition: any) {
		if (!condition) {
			return this;
		}

		// Parse the query
		const parsedQuery = queryUtil.parse(
			condition,
			this.params.ExpressionAttributeValues
		);

		if (this.params.ConditionExpression) {
			this.params.ConditionExpression = `(${this.params.ConditionExpression}) AND (${parsedQuery.ConditionExpression})`;
		} else {
			this.params.ConditionExpression = parsedQuery.ConditionExpression;
		}

		// Add the parsed query attributes to the correct properties of the params object
		this.params.ExpressionAttributeNames = {
			...this.params.ExpressionAttributeNames,
			...parsedQuery.ExpressionAttributeNames,
		};
		this.params.ExpressionAttributeValues = {
			...this.params.ExpressionAttributeValues,
			...parsedQuery.ExpressionAttributeValues,
		};

		// Return the object for chaining purposes
		return this;
	}

	/**
	 * Builds and returns the raw DynamoDB query object.
	 */
	buildRawQuery(): UpdateCommandInput {
		return {
			...this.params,
			TableName: this.table!.name,
		} as UpdateCommandInput;
	}

	/**
	 * This method will execute the update item request that was built up.
	 */
	async exec(): Promise<any> {
		const db = this.dynamodb.raw;

		if (!db) {
			throw new Error("Call .connect() before executing queries.");
		}

		return this.runQuery(() => db.update(this.buildRawQuery())).then((data) => {
			// Return the attributes
			return this.rawResult === true ? data : data.Attributes;
		});
	}
}
