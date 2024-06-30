# Changelog

## [1.2.0](https://github.com/WMS-Corporation/wms-taskControl-service/compare/v1.1.0...v1.2.0) (2024-06-30)


### Features

* Add validations for product existence, shelf presence, and stock in task creation and updating ([f1eabca](https://github.com/WMS-Corporation/wms-taskControl-service/commit/f1eabca614fbfedc2f795bfab10fdc204f3b2558))


### Bug Fixes

* Update method that validate the product constraints ([600f9fb](https://github.com/WMS-Corporation/wms-taskControl-service/commit/600f9fb5a96c87e6b9d86737a7a31d702e7c83c9))
* Updated method that modified task data ([f01a7be](https://github.com/WMS-Corporation/wms-taskControl-service/commit/f01a7bef4d44b77b4e1989de8c5c7c20f16b2b71))
* Updated method that return all tasks stored ([3fa6d01](https://github.com/WMS-Corporation/wms-taskControl-service/commit/3fa6d01963cf94d2779ab7e5b3b90c7cfb7c50ec))

## [1.1.0](https://github.com/WMS-Corporation/wms-taskControl-service/compare/v1.0.1...v1.1.0) (2024-05-03)


### Features

* Implemented method that send product's data to logistic service when task is completed ([3c37510](https://github.com/WMS-Corporation/wms-taskControl-service/commit/3c37510b35ab0873960cb50e969a8d707880ea0a))


### Bug Fixes

* Added control if counter collection exists ([47c8352](https://github.com/WMS-Corporation/wms-taskControl-service/commit/47c8352d8629f7f5a735cb2036fb5a93eda15742))
* Modified function that return all Tasks avainable ([f40c072](https://github.com/WMS-Corporation/wms-taskControl-service/commit/f40c072b69dd42cd0aec0181b70e45a39a2a54e1))
* Modified method that update task data ([9b7e8d9](https://github.com/WMS-Corporation/wms-taskControl-service/commit/9b7e8d9635685d38ec658a98ac0f65239e5d343b))
* **task:** getAll return empty list if no result instead of 0 ([15a818e](https://github.com/WMS-Corporation/wms-taskControl-service/commit/15a818e0ec5912d933e5fa59ed2744927ddf53f0))
* Updated method that return the tasks assigned ([824633f](https://github.com/WMS-Corporation/wms-taskControl-service/commit/824633f17357ae8a0d5116999e683d5df728b79e))
* Updated method that return the tasks assigned ([647047e](https://github.com/WMS-Corporation/wms-taskControl-service/commit/647047e64aa34d131d09b73a8ee7a6d73d2cb2da))
* Updated product structure in Task and implemented control about the upated of product list ([553ba4e](https://github.com/WMS-Corporation/wms-taskControl-service/commit/553ba4e93b4a721b1b4e59025599994397aaee62))
* Updated the structure of task product list and added body field validation and data modification methods ([c0bef2f](https://github.com/WMS-Corporation/wms-taskControl-service/commit/c0bef2f670a9c9652815337253e0cd9577fab906))

## [1.0.1](https://github.com/WMS-Corporation/wms-taskControl-service/compare/v1.0.0...v1.0.1) (2024-03-19)


### Bug Fixes

* Modified route's permissions to allowed admin user to modified a task's status ([b09530e](https://github.com/WMS-Corporation/wms-taskControl-service/commit/b09530ebabc0eb04eaaa75edc3ecd46425726742))

## 1.0.0 (2024-03-13)


### Features

* add automatic test, sonarcloud analisys and release-please ([96694e4](https://github.com/WMS-Corporation/wms-taskControl-service/commit/96694e46c1052653f7f1b8f4921720c95233306a))
* Implemented an Task entity and its corresponding factory class ([0a763a2](https://github.com/WMS-Corporation/wms-taskControl-service/commit/0a763a2a1714099aa5565802624d132ec9698030))
* Implemented connection to DB ([59f5918](https://github.com/WMS-Corporation/wms-taskControl-service/commit/59f591880c689fd5698998bb9cb1355a2e5ee377))
* Implemented middleware to safeguard routes of service ([a84345e](https://github.com/WMS-Corporation/wms-taskControl-service/commit/a84345e18893e3e191ef2f585070e09410cff0aa))
* Implemented route that returns all tasks assigned to a specific user ([6151953](https://github.com/WMS-Corporation/wms-taskControl-service/commit/61519537b5973318e27577b11b1dee02cbeecdd1))
* Implemented route that returns the task based on its code ([7e85b83](https://github.com/WMS-Corporation/wms-taskControl-service/commit/7e85b8357577bc50665344e140da73c5f1e6c012))
* Implemented route to create a new task ([b212bb2](https://github.com/WMS-Corporation/wms-taskControl-service/commit/b212bb2e0444647725e49ec65b99636fd0cd995b))
* Implemented route to return all task assigned to operators ([340f84e](https://github.com/WMS-Corporation/wms-taskControl-service/commit/340f84ec5e2b3265a4973841e9b9acdf4e9dc4b6))
* Implemented route to updated the status of task ([3146c4c](https://github.com/WMS-Corporation/wms-taskControl-service/commit/3146c4c80a38db1ae683fed4942e8aa94266fe54))


### Bug Fixes

* fix coverage test setup ([5b7d34f](https://github.com/WMS-Corporation/wms-taskControl-service/commit/5b7d34f65f2e1fe4eafaf88da9c2182fc47e87f6))
