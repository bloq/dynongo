import { UpdateCommandInput } from "@aws-sdk/lib-dynamodb";
import * as queryUtil from "../utils/query";
import * as updateUtil from "../utils/update";
import { Executable } from "./executable";
import { Method } from "./method";
import { DynamoDB } from "../dynamodb";
import { Table } from "../table";
import { UpdateQuery } from "../types";

export class InsertItem extends Method implements Executable {
	protected rawResult: boolean = false;

	constructor(table: Table, dynamodb: DynamoDB) {
		super(table, dynamodb);

		this.params.ReturnValues = "ALL_NEW";
	}

	/**
	 * Initialize the `InsertItem` object.
	 *
	 * @param	query			The key of the item to insert.
	 * @param	data			The insert data object.
	 */
	initialize(query: any, data: UpdateQuery) {
		// Set the query as key
		this.params.Key = query;

		// Parse the data
		const parsedData = updateUtil.parse(data);

		// Append the attributes to the correct properties
		this.params.UpdateExpression = parsedData.UpdateExpression;
		this.params.ExpressionAttributeNames = {
			...this.params.ExpressionAttributeNames,
			...parsedData.ExpressionAttributeNames,
		};
		this.params.ExpressionAttributeValues = {
			...this.params.ExpressionAttributeValues,
			...parsedData.ExpressionAttributeValues,
		};

		// Return the object so that it can be chained
		return this;
	}

	/**
	 * Returns the raw result.
	 */
	raw() {
		// Set the raw parameter to true.
		this.rawResult = true;

		// Return the query so that it can be chained
		return this;
	}

	/**
	 * Builds and returns the raw DynamoDB query object.
	 */
	buildRawQuery(): UpdateCommandInput {
		// Parse the query to add a negated condition expression https://github.com/SamVerschueren/dynongo/issues/3
		const parsedQuery = queryUtil.parse(this.params.Key || {});

		const result = {
			...this.params,
			TableName: this.table!.name,
			ConditionExpression: `NOT (${parsedQuery.ConditionExpression})`,
			ExpressionAttributeNames: {
				...this.params.ExpressionAttributeNames,
				...parsedQuery.ExpressionAttributeNames,
			},
			ExpressionAttributeValues: {
				...this.params.ExpressionAttributeValues,
				...parsedQuery.ExpressionAttributeValues,
			},
		} as UpdateCommandInput;

		if (result.UpdateExpression === "") {
			delete result.UpdateExpression;
		}

		return result;
	}

	/**
	 * Execute the insert item request.
	 */
	async exec(): Promise<any> {
		const db = this.dynamodb.raw;

		if (!db) {
			throw new Error("Call .connect() before executing queries.");
		}

		const insertInput = this.buildRawQuery();

		return this.runQuery(() => db.update(insertInput))
			.then((data) => {
				// Return the attributes
				return this.rawResult === true ? data : data.Attributes;
			})
			.catch((err) => {
				if (err.code === "ConditionalCheckFailedException") {
					err.message =
						"Duplicate key! A record with key `" +
						JSON.stringify(insertInput.Key) +
						"` already exists.";
				}

				throw err;
			});
	}
}
